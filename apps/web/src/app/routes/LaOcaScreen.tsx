import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import styles from './LaOcaScreen.module.css';

interface GameUIProps {
  room: any;
  hand?: any;
  user?: any;
  playersInfo: any[];
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Previa / Rompehielo',
  2: 'Cahuín / Picante',
  3: 'Calentura / Hot',
  4: 'Modo Valiente / Sin Filtro'
};

const DICE_EMOJIS = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export function LaOcaScreen({ room, user, playersInfo }: GameUIProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [displayDice, setDisplayDice] = useState<number>(room.state.lastDiceRoll || 1);
  const activeTileRef = useRef<HTMLDivElement | null>(null);

  const isMyTurn = room.state.turnPlayerId === user?.id;
  const isHost = room.host_id === user?.id;
  const turnPlayerName = playersInfo.find((p: any) => p.id === room.state.turnPlayerId)?.nickname || 'Jugador';
  const winnerName = playersInfo.find((p: any) => p.id === room.state.winnerId)?.nickname || 'Ganador';

  useEffect(() => {
    if (room.state.lastDiceRoll) {
      setDisplayDice(room.state.lastDiceRoll);
    }
  }, [room.state.lastDiceRoll]);

  // Disparar confeti en victoria
  useEffect(() => {
    if (room.state.phase === 'finished') {
      confetti({
        particleCount: 180,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [room.state.phase]);

  // Auto-scroll a la casilla del jugador de turno
  useEffect(() => {
    if (activeTileRef.current) {
      activeTileRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [room.state.turnIndex, room.state.phase]);

  const handleRollDice = async () => {
    if (!isMyTurn || isRolling || room.state.phase !== 'playing') return;
    setIsRolling(true);

    // Animación rápida de giro de dados
    const interval = setInterval(() => {
      setDisplayDice(Math.floor(Math.random() * 6) + 1);
    }, 80);

    try {
      const { data, error } = await supabase.functions.invoke('game-action', {
        body: { roomId: room.id, action: { type: 'ROLL_DICE' } }
      });
      clearInterval(interval);
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    } catch (err: any) {
      clearInterval(interval);
      alert(err.message || 'Error al tirar los dados');
    } finally {
      setIsRolling(false);
    }
  };

  const handleResolveEvent = async (success: boolean) => {
    if ((!isMyTurn && !isHost) || isResolving || room.state.phase !== 'event_active') return;
    setIsResolving(true);
    try {
      const { data, error } = await supabase.functions.invoke('game-action', {
        body: { roomId: room.id, action: { type: 'RESOLVE_EVENT', success } }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    } catch (err: any) {
      alert(err.message || 'Error al resolver el evento');
    } finally {
      setIsResolving(false);
    }
  };

  const handleLeaveGame = async () => {
    if (!window.confirm("¿Seguro que quieres salir de la partida?")) return;
    window.location.href = '/';
  };

  const handleRestartGame = async () => {
    if (!isHost) return;
    try {
      await supabase.functions.invoke('game-action', {
        body: { roomId: room.id, action: { type: 'START_GAME' } }
      });
    } catch (err: any) {
      alert(err.message || 'Error al reiniciar la partida');
    }
  };

  // === PANTALLA DE VICTORIA ===
  if (room.state.phase === 'finished') {
    const sortedPlayers = [...(room.state.players || [])].sort((a, b) => b.sipsTaken - a.sipsTaken);

    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className={styles.victoryWrapper}>
          <div className={styles.victoryCrown}>👑</div>
          <h1 style={{ color: 'var(--color-warning)', margin: '0.5rem 0' }}>¡{winnerName} ha ganado!</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Llegó a la casilla 50 (El Cáliz del Rey).
          </p>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: 'var(--radius-lg)', padding: '1rem', margin: '1rem 0' }}>
            <h3 style={{ color: '#f59e0b', margin: '0 0 0.5rem 0' }}>🏆 Rito de Coronación</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              El Rey corona su victoria eligiendo a <strong>dos perdedores</strong> para tomarse un Fondo Blanco con él.
            </p>
          </div>

          <table className={styles.victoryTable}>
            <thead>
              <tr>
                <th>Jugador</th>
                <th>Sorbos 🍺</th>
                <th>Arrugadas 🐔</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((p: any) => {
                const info = playersInfo.find((pi: any) => pi.id === p.id);
                return (
                  <tr key={p.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: p.color }}></span>
                      {info?.nickname || 'Jugador'}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-warning)' }}>{p.sipsTaken}</td>
                    <td style={{ color: 'var(--color-danger)' }}>{p.timesChickened}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
            {isHost && (
              <button 
                onClick={handleRestartGame} 
                style={{ flex: 1, padding: '0.8rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}
              >
                Jugar Otra Vez
              </button>
            )}
            <button 
              onClick={() => window.location.href = '/'} 
              style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid var(--color-border)', color: 'white', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
            >
              Volver al Menú
            </button>
          </div>
        </div>
      </div>
    );
  }

  // === PANTALLA PRINCIPAL DE JUEGO ===
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <span className={styles.roundBadge}>Ronda {room.state.round || 1}</span>
          <span className={styles.turnText}>
            {isMyTurn ? '👉 ¡Es tu turno!' : `Turno: ${turnPlayerName}`}
          </span>
        </div>
        <button 
          onClick={handleLeaveGame}
          style={{ padding: '0.4rem 0.8rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          Salir
        </button>
      </header>

      {/* Banner de Maldiciones Activas */}
      {room.state.activeCurses && room.state.activeCurses.length > 0 && (
        <div className={styles.cursesBanner}>
          <span>⚡</span>
          <span>
            {room.state.activeCurses.map((c: any) => {
              const pName = playersInfo.find((p: any) => p.id === c.playerId)?.nickname || 'Alguien';
              return `${pName}: ${c.title}`;
            }).join(' | ')}
          </span>
        </div>
      )}

      <main className={styles.main}>
        {/* Tablero de 50 Casillas */}
        <div className={styles.boardScrollArea}>
          <div className={styles.boardGrid}>
            {room.state.tiles?.map((tile: any) => {
              const playersOnTile = room.state.players?.filter((p: any) => p.position === tile.index) || [];
              const hasActivePlayer = playersOnTile.some((p: any) => p.id === room.state.turnPlayerId);

              let tileClass = styles.tile;
              if (tile.type === 'shortcut') tileClass += ` ${styles.tileShortcut}`;
              else if (tile.type === 'trap') tileClass += ` ${styles.tileTrap}`;
              else if (tile.type === 'cascade') tileClass += ` ${styles.tileCascade}`;
              else if (tile.type === 'safe') tileClass += ` ${styles.tileSafe}`;
              else if (tile.type === 'finish') tileClass += ` ${styles.tileFinish}`;

              if (hasActivePlayer) tileClass += ` ${styles.tileCurrent}`;

              let icon = '🎲';
              if (tile.type === 'shortcut') icon = '⚡';
              else if (tile.type === 'trap') icon = '🕳️';
              else if (tile.type === 'cascade') icon = '🍻';
              else if (tile.type === 'safe') icon = '🍔';
              else if (tile.type === 'finish') icon = '👑';

              return (
                <div 
                  key={tile.index} 
                  ref={hasActivePlayer ? activeTileRef : null}
                  className={tileClass}
                >
                  <div className={styles.tileNumber}>#{tile.index}</div>
                  <div className={styles.tileIcon}>{icon}</div>
                  {tile.label && <div className={styles.tileLabel}>{tile.label}</div>}

                  {playersOnTile.length > 0 && (
                    <div className={styles.playerTokensWrapper}>
                      {playersOnTile.map((p: any) => {
                        const info = playersInfo.find((pi: any) => pi.id === p.id);
                        const isCurrentTurn = p.id === room.state.turnPlayerId;
                        return (
                          <div 
                            key={p.id} 
                            className={`${styles.playerToken} ${isCurrentTurn ? styles.tokenActive : ''}`}
                            style={{ backgroundColor: p.color }}
                            title={`${info?.nickname || 'Jugador'} (${p.sipsTaken} sorbos)`}
                          >
                            {info?.nickname?.charAt(0).toUpperCase() || '?'}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Barra de Tirada de Dados */}
        <div className={styles.diceActionBar}>
          <div className={styles.diceInfo}>
            <motion.div 
              className={styles.diceDisplay}
              animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ repeat: isRolling ? Infinity : 0, duration: 0.3 }}
            >
              {DICE_EMOJIS[(displayDice || 1) - 1]}
            </motion.div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Última tirada</span>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>Dado: {displayDice}</span>
            </div>
          </div>

          <button 
            className={styles.rollButton}
            onClick={handleRollDice}
            disabled={!isMyTurn || isRolling || room.state.phase !== 'playing'}
          >
            {isRolling ? 'Tirando dados...' : isMyTurn ? '🎲 Tirar Dado (1D6)' : `Esperando a ${turnPlayerName}`}
          </button>
        </div>
      </main>

      {/* Modal de Evento Activo */}
      <AnimatePresence>
        {room.state.phase === 'event_active' && room.state.currentEvent && (
          <div className={styles.modalOverlay}>
            <motion.div 
              className={styles.eventCard}
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
            >
              <div className={`${styles.levelBadge} ${styles[`level${room.state.currentEvent.level || 1}`]}`}>
                Nivel {room.state.currentEvent.level || 1} • {LEVEL_LABELS[room.state.currentEvent.level || 1]}
              </div>

              <h2 className={styles.eventTitle}>{room.state.currentEvent.title}</h2>

              <div className={styles.eventDescription}>
                {room.state.currentEvent.description}
              </div>

              <div className={styles.eventStakes}>
                {room.state.currentEvent.sips > 0 && (
                  <span className={styles.stakeSips}>
                    🍺 {room.state.currentEvent.sips} sorbos si cumple
                  </span>
                )}
                {room.state.currentEvent.penaltySips > 0 && (
                  <span className={styles.stakePenalty}>
                    🐔 {room.state.currentEvent.penaltySips} sorbos si arruga
                  </span>
                )}
              </div>

              {(isMyTurn || isHost) && (
                <div className={styles.eventActions}>
                  <button 
                    className={styles.btnSuccess}
                    onClick={() => handleResolveEvent(true)}
                    disabled={isResolving}
                  >
                    ✅ ¡Cumplido!
                  </button>
                  <button 
                    className={styles.btnChicken}
                    onClick={() => handleResolveEvent(false)}
                    disabled={isResolving}
                  >
                    🐔 Arrugó / Paga
                  </button>
                </div>
              )}

              {!isMyTurn && !isHost && (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  Esperando que {turnPlayerName} o el Host confirmen el reto...
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
