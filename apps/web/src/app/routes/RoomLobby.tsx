import { useParams } from 'react-router-dom';
import { useRoom } from '../../lib/useRoom';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Crown, Users } from '@phosphor-icons/react';
import { gameUIRegistry } from '../../games/registry';
import styles from './RoomLobby.module.css';

export default function RoomLobby() {
  const { id } = useParams<{ id: string }>();
  const { room, hand, loading, error } = useRoom(id);
  const [playersInfo, setPlayersInfo] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  useEffect(() => {
    if (room?.state?.players) {
      const fetchPlayers = async () => {
        const playerIds = room.state.players.map((p: any) => p.id);
        const { data } = await supabase.from('player_private').select('id, nickname').in('id', playerIds);
        if (data) setPlayersInfo(data);
      };
      fetchPlayers();
    }
  }, [room?.state?.players]);

  const handleStartGame = async () => {
    setIsStarting(true);
    try {
      const { data, error } = await supabase.functions.invoke('game-action', {
        body: { roomId: room.id, action: { type: 'START_GAME' } }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al iniciar el juego');
    } finally {
      setIsStarting(false);
    }
  };

  if (loading) return <div className={styles.container}>Cargando sala...</div>;
  if (error) return <div className={styles.container}>Error: {error.message}</div>;
  if (!room) return <div className={styles.container}>Sala no encontrada</div>;

  const isHost = currentUserId === room.host_id;

  // Si la sala ya no está en lobby, mostramos la interfaz del juego (Board/Player View)
  if (room.state.phase && room.state.phase !== 'lobby') {
    const gameId = room.game_id || room.state.gameId;
    const GameUIComponent = gameUIRegistry[gameId];
    
    if (!GameUIComponent) {
      return <div className={styles.container}>Error: Interfaz de juego no encontrada ({gameId})</div>;
    }
    
    return (
      <GameUIComponent 
        room={room} 
        hand={hand} 
        user={{ id: currentUserId }} 
        playersInfo={playersInfo} 
      />
    );
  }

  // Vista de Lobby normal
  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
          >
            ← Salir
          </button>
          <h1 className={styles.roomCode}>{room.id}</h1>
          <div style={{ width: '60px' }}></div> {/* Spacer for centering */}
        </div>
        <p className={styles.roomStatus}>Esperando a los demás perkinazos...</p>
      </header>
      
      <main className={styles.main}>
        <section className={styles.playersSection}>
          <div className={styles.sectionHeader}>
            <Users size={24} className={styles.icon} />
            <h2>Jugadores ({room.state.players?.length || 0})</h2>
          </div>
          
          <ul className={styles.playerList}>
            {room.state.players?.map((p: any) => {
              const info = playersInfo.find(pi => pi.id === p.id);
              const isPlayerHost = room.host_id === p.id;
              
              return (
                <li key={p.id} className={styles.playerItem}>
                  <div className={styles.playerInfo}>
                    {info?.avatar_url ? (
                      <img src={info.avatar_url} alt={info.nickname} className={styles.avatarImg} />
                    ) : (
                      <div className={styles.avatarFallback}>
                        {info?.nickname?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <span className={styles.playerName}>
                      {info?.nickname || 'Cargando...'}
                      {p.id === currentUserId && ' (Tú)'}
                    </span>
                  </div>
                  {isPlayerHost && (
                    <div className={styles.hostBadge}>
                      <Crown size={16} weight="fill" />
                      <span>Host</span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        {isHost && (
          <section className={styles.hostSection}>
            <button 
              className={styles.buttonPrimary} 
              disabled={isStarting || room.state.players?.length < 3}
              onClick={handleStartGame}
            >
              {isStarting ? 'Iniciando...' : 'Iniciar Juego'}
            </button>
            {room.state.players?.length < 3 && (
              <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                Se necesitan al menos 3 jugadores para empezar.
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
