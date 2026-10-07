import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"
import { gameRegistry } from "../_shared/engine/registry.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error("No autenticado")

    const { roomId, action, expectedVersion } = await req.json()
    if (!roomId || !action) throw new Error("Faltan parámetros")

    // Retry loop para optimistic concurrency
    let success = false;
    let retries = 3;
    let latestVersion = 0;

    while (!success && retries > 0) {
      // 1. Cargar el estado completo actual
      const { data: room, error: roomError } = await supabaseAdmin.from('rooms').select('*').eq('id', roomId).single()
      if (roomError || !room) throw new Error("Sala no encontrada")
      
      latestVersion = room.version;
      // if (expectedVersion && room.version !== expectedVersion) {
      //   // TODO: Handle strict versioning if needed, but retrying with latest is usually fine
      // }

      const gameId = room.game_id || room.state.gameId;
      const engine = gameRegistry[gameId];
      if (!engine) {
        throw new Error("Juego no soportado o no registrado: " + gameId)
      }

      const { data: secrets, error: secretsError } = await supabaseAdmin.from('room_secrets').select('*').eq('room_id', roomId).single()
      if (secretsError || !secrets) throw new Error("Secretos de sala no encontrados")

      const { data: handsData, error: handsError } = await supabaseAdmin.from('player_hands').select('*').eq('room_id', roomId)
      if (handsError) throw new Error("Error cargando manos")

      // Construir FullState
      let fullState: any = {
        publicState: room.state,
        privateState: {},
        secretState: secrets.state || {}
      }

      handsData.forEach((h: any) => {
        fullState.privateState[h.user_id] = h.state;
      })

      console.log("==> BEFORE SETUP:", JSON.stringify(fullState.publicState));
      console.log("==> ACTION:", JSON.stringify(action));

      // CASO ESPECIAL: Inicialización si es START_GAME y phase no existe
      if (action.type === 'START_GAME' && !fullState.publicState.phase) {
        // Ejecutar setup primero
        const playersList = room.state.players.map((p: any) => p.id);
        const setupResult = engine.setup({
          players: playersList,
          settings: room.state.settings || {},
          seed: Date.now().toString()
        });

        if (gameId === 'hora-del-nache') {
          const deckIds = room.state.settings?.decks || ['00000000-0000-0000-0000-000000000000'];
          const validDeckIds = deckIds.map((id: string) => id === 'base' ? '00000000-0000-0000-0000-000000000000' : id);
          
          const { data: allCards } = await supabaseAdmin.from('cards').select('*').in('deck_id', validDeckIds);
          
          setupResult.secretState.blackDeck = allCards?.filter(c => c.kind === 'black') || [];
          setupResult.secretState.whiteDeck = allCards?.filter(c => c.kind === 'white') || [];
          
          // Shuffle inicial usando math.random porque es solo el setup
          setupResult.secretState.blackDeck.sort(() => Math.random() - 0.5);
          setupResult.secretState.whiteDeck.sort(() => Math.random() - 0.5);
        }

        fullState = setupResult;
      }

      // 2. Ejecutar Reducer
      const newState = engine.reduce(fullState, action, {
        actorId: user.id,
        timestamp: Date.now()
      });

      if ('error' in newState) {
        throw new Error(newState.error as string);
      }

      // 3. Guardar estado con optimistic locking
      const { error: updateRoomError } = await supabaseAdmin.from('rooms')
        .update({
          state: { ...room.state, ...newState.publicState },
          version: room.version + 1
        })
        .eq('id', roomId)
        .eq('version', room.version)

      if (updateRoomError) {
        retries--;
        continue; // Optimistic locking failed, retry
      }

      // Si room update fue exitoso, garantizamos que las demás updates son seguras (idealmente en transacción, pero servirá)
      const ops = [];
      ops.push(supabaseAdmin.from('room_secrets')
        .update({ state: newState.secretState })
        .eq('room_id', roomId));

      // Upsert hands
      for (const [playerId, handState] of Object.entries(newState.privateState)) {
        ops.push(supabaseAdmin.from('player_hands')
          .upsert({ room_id: roomId, user_id: playerId, state: handState }));
      }
      
      await Promise.all(ops);

      success = true;
      latestVersion = room.version + 1;
    }

    if (!success) {
      throw new Error("Error de concurrencia al actualizar el juego")
    }

    return new Response(JSON.stringify({ success: true, version: latestVersion }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error: any) {
    console.error("Game action error:", error.message);
    console.error(error.stack);
    return new Response(JSON.stringify({ error: error.message }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
