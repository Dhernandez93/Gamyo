import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4"
import { broadcastRoomSync } from "../_shared/broadcast.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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

    const { action, payload } = await req.json()

    if (action === 'create') {
      // Check if user is anonymous (we can check by user metadata or just fetch from player_private)
      const { data: profile } = await supabaseAdmin.from('player_private').select('is_anonymous').eq('id', user.id).single()
      if (profile?.is_anonymous) {
        throw new Error("Usuarios anónimos no pueden crear salas")
      }

      const { gameId, settings } = payload || {};
      if (!gameId) throw new Error("Debes elegir un juego para la sala");

      const roomId = generateRoomId()
      // Guardar el juego seleccionado, anfitrión y settings en el estado
      const initial_state = { gameId, players: [ { id: user.id, score: 0 } ], settings: settings || {} }
      
      const { error } = await supabaseAdmin.from('rooms').insert({
        id: roomId,
        host_id: user.id,
        state: initial_state
      })
      if (error) throw error;
      
      const { error: secretsError } = await supabaseAdmin.from('room_secrets').insert({
        room_id: roomId,
        state: {}
      })
      if (secretsError) throw secretsError;

      // Crear registro de mano privada para el host
      await supabaseAdmin.from('player_hands').insert({
        room_id: roomId,
        user_id: user.id,
        state: {}
      });
      
      return new Response(JSON.stringify({ roomId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'join') {
      const { roomId } = payload
      if (!roomId || roomId.length !== 4) throw new Error("Código de sala inválido")

      const roomCode = roomId.toUpperCase()

      // Retry mechanism para concurrencia optimista
      let joined = false;
      let retries = 3;

      while (!joined && retries > 0) {
        const { data: room, error: roomError } = await supabaseAdmin.from('rooms').select('*').eq('id', roomCode).single()
        if (roomError || !room) throw new Error("Sala no encontrada")

        const players = room.state.players || []
        if (!players.find((p: any) => p.id === user.id)) {
          players.push({ id: user.id, score: 0 })
          
          const { data: updatedRows, error: updateError } = await supabaseAdmin.from('rooms')
            .update({
              state: { ...room.state, players },
              version: room.version + 1
            })
            .eq('id', roomCode)
            .eq('version', room.version)
            .select()

          if (!updateError && updatedRows && updatedRows.length > 0) {
            // Updated successfully
            joined = true;
            await supabaseAdmin.from('player_hands').upsert({
              room_id: roomCode,
              user_id: user.id,
              state: {}
            });
            await broadcastRoomSync(roomCode, updatedRows[0], [])
          } else {
            retries--;
          }
        } else {
          // Ya estaba en la sala
          joined = true;
        }
      }

      if (!joined) throw new Error("Error de concurrencia al unirse a la sala")

      return new Response(JSON.stringify({ success: true, roomId: roomCode }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    throw new Error("Acción desconocida")
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
