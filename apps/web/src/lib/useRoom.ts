import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';

/**
 * Sincronización de sala en tiempo real.
 *
 * Estrategia (en orden de prioridad):
 *  1. Realtime Broadcast en el tópico `room:{CODE}` emitido por las Edge Functions
 *     tras cada acción (evento 'sync' con el estado público completo). ~100-200ms.
 *  2. Si nuestra mano cambió (handUserIds incluye nuestro id) se re-lee la mano por REST
 *     (las manos son privadas y nunca viajan por un canal público).
 *  3. Re-sincronización al volver a la pestaña / reconectar el canal.
 *  4. Polling de respaldo lento (8s) por si el socket se cae en redes móviles.
 *
 * Los updates de sala se aplican solo si `version` es mayor a la actual, evitando
 * que un mensaje atrasado pise un estado más nuevo.
 */
export function useRoom(roomId: string | undefined) {
  const [room, setRoom] = useState<any>(null);
  const [hand, setHand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const versionRef = useRef<number>(0);

  useEffect(() => {
    if (!roomId) return;
    const code = roomId.toUpperCase();

    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let userId: string | null = null;

    const applyRoom = (next: any) => {
      if (!mounted || !next || next.id?.trim?.() !== code) return;
      if ((next.version ?? 0) < versionRef.current) return; // mensaje atrasado
      versionRef.current = next.version ?? 0;
      setRoom(next);
    };

    const fetchRoom = async () => {
      const { data, error: roomError } = await supabase.from('rooms').select('*').eq('id', code).maybeSingle();
      if (roomError) throw roomError;
      if (data) applyRoom(data);
      return data;
    };

    const fetchHand = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from('player_hands')
        .select('state')
        .eq('room_id', code)
        .eq('user_id', userId)
        .maybeSingle();
      if (data && mounted) {
        setHand((prev: any) => (JSON.stringify(prev) === JSON.stringify(data.state) ? prev : data.state));
      }
    };

    const resync = () => {
      fetchRoom().catch(() => {});
      fetchHand().catch(() => {});
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') resync();
    };

    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted) return;
        if (!user) throw new Error('No autenticado');
        userId = user.id;

        // Suscribir ANTES de leer el estado inicial para no perder eventos intermedios
        supabase.getChannels().forEach((c) => {
          if (c.topic === `realtime:room:${code}`) supabase.removeChannel(c);
        });

        channel = supabase
          .channel(`room:${code}`, { config: { broadcast: { self: false } } })
          .on('broadcast', { event: 'sync' }, ({ payload }) => {
            if (payload?.room) applyRoom(payload.room);
            if (Array.isArray(payload?.handUserIds) && payload.handUserIds.includes(userId)) {
              fetchHand().catch(() => {});
            }
          })
          .subscribe((status) => {
            // Al (re)conectar, re-sincronizar por si se perdió algo mientras estaba caído
            if (status === 'SUBSCRIBED') resync();
          });

        const roomData = await fetchRoom();
        if (!roomData) throw new Error('Sala no encontrada');
        await fetchHand();
        if (mounted) setLoading(false);

        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('online', resync);

        // Fallback lento por si el WebSocket muere silenciosamente
        pollInterval = setInterval(() => {
          if (document.visibilityState === 'visible') resync();
        }, 8000);
      } catch (err: any) {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    versionRef.current = 0;
    init();

    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
      if (pollInterval) clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', resync);
    };
  }, [roomId]);

  return { room, hand, loading, error };
}
