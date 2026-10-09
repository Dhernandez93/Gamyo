// Envía eventos en tiempo real vía Supabase Realtime Broadcast (REST).
// No depende de la replicación lógica (postgres_changes), por lo que es
// más rápido (~100-200ms) y mucho más confiable.
//
// Tópico: `room:{ROOM_ID}`
//  - event 'sync': { room, handUserIds }  -> estado público completo + ids cuyas manos cambiaron

export async function broadcastRoomSync(roomId: string, room: unknown, handUserIds: string[] = []) {
  const url = Deno.env.get('SUPABASE_URL') ?? ''
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  try {
    const res = await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        messages: [
          {
            topic: `room:${roomId}`,
            event: 'sync',
            payload: { room, handUserIds },
            private: false,
          },
        ],
      }),
    })
    if (!res.ok) console.error('Broadcast failed', res.status, await res.text())
  } catch (e) {
    // Nunca romper la acción del juego por un fallo de broadcast; el cliente tiene fallback.
    console.error('Broadcast error', (e as Error).message)
  }
}
