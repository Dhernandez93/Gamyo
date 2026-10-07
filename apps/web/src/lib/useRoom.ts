import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function useRoom(roomId: string | undefined) {
  const [room, setRoom] = useState<any>(null);
  const [hand, setHand] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!roomId) return;

    let mounted = true;
    let roomChannel: any;
    let handChannel: any;

    const fetchInitial = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !mounted) throw new Error('No autenticado o desmontado');

        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (roomError) throw roomError;
        if (mounted) setRoom(roomData);

        const { data: handData } = await supabase
          .from('player_hands')
          .select('*')
          .eq('room_id', roomId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (handData && mounted) setHand(handData.state);
        if (mounted) setLoading(false);

        if (!mounted) return;

        // Eliminar canales huérfanos previos para evitar el error de "cannot add callbacks after subscribe"
        supabase.getChannels().forEach(c => {
          if (c.topic === `realtime:room:${roomId}` || c.topic === `realtime:hand:${roomId}:${user.id}`) {
            supabase.removeChannel(c);
          }
        });

        // Suscribirse a la sala
        roomChannel = supabase.channel(`room:${roomId}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
            console.log("🔥 REALTIME ROOM UPDATE:", payload.new);
            const newData = payload.new as any;
            if (newData && newData.id === roomId.toUpperCase() && mounted) {
              setRoom({ ...newData });
            }
          })
          .subscribe((status) => {
            console.log("🔥 ROOM CHANNEL STATUS:", status);
          });

        // Suscribirse a la mano
        handChannel = supabase.channel(`hand:${roomId}:${user.id}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'player_hands' }, (payload) => {
            console.log("🔥 REALTIME HAND UPDATE:", payload.new);
            const newData = payload.new as any;
            if (newData && newData.room_id === roomId.toUpperCase() && newData.user_id === user.id && mounted) {
              setHand({ ...newData.state });
            }
          })
          .subscribe();

      } catch (err: any) {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      mounted = false;
      if (roomChannel) supabase.removeChannel(roomChannel);
      if (handChannel) supabase.removeChannel(handChannel);
    };
  }, [roomId]);

  return { room, hand, loading, error };
}
