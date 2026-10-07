import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { GameCard } from '../../components/GameCard';
import styles from './GameScreen.module.css';

export function GameScreen({ room, hand, user, playersInfo }: any) {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCzar = room.state.czarId === user?.id;
  const hasSubmitted = room.state.submittedBy?.includes(user?.id);
  const pickCount = room.state.blackCard?.pick || 1;

  const handleCardClick = (cardId: string) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(prev => prev.filter(id => id !== cardId));
    } else {
      if (selectedCards.length < pickCount) {
        setSelectedCards(prev => [...prev, cardId]);
      }
    }
  };

  const handleSubmitCards = async () => {
    if (selectedCards.length !== pickCount) return;
    setIsSubmitting(true);
    
    // Obtenemos los objetos completos de las cartas seleccionadas
    const cardsToPlay = selectedCards.map(id => hand.hand.find((c: any) => c.id === id));
    
    try {
      const { data, error } = await supabase.functions.invoke('game-action', {
        body: { roomId: room.id, action: { type: 'PLAY_CARDS', cards: cardsToPlay } }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSelectedCards([]);
    } catch (err: any) {
      alert(err.message || 'Error al jugar las cartas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePickWinner = async (anonId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('game-action', {
        body: { roomId: room.id, action: { type: 'PICK_WINNER', anonId } }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    } catch (err: any) {
      alert(err.message || 'Error al elegir ganador');
    }
  };

  const handleNextRound = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('game-action', {
        body: { roomId: room.id, action: { type: 'NEXT_ROUND' } }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    } catch (err: any) {
      alert(err.message || 'Error al pasar de ronda');
    }
  };

  const handleLeaveGame = async () => {
    if (!window.confirm("¿Seguro que quieres abandonar la partida?")) return;
    try {
      await supabase.functions.invoke('game-action', {
        body: { roomId: room.id, action: { type: 'LEAVE_GAME' } }
      });
      window.location.href = '/';
    } catch (err: any) {
      alert(err.message || 'Error al salir de la sala');
    }
  };

  const handleReturnToLobby = async () => {
    if (!window.confirm("¿Seguro que quieres cancelar la partida actual y volver al lobby?")) return;
    try {
      await supabase.functions.invoke('game-action', {
        body: { roomId: room.id, action: { type: 'RETURN_TO_LOBBY' } }
      });
    } catch (err: any) {
      alert(err.message || 'Error al volver al lobby');
    }
  };

  const czarName = playersInfo.find((p: any) => p.id === room.state.czarId)?.nickname || 'Alguien';

  // === PANTALLA DE VICTORIA (FIN DEL JUEGO) ===
  if (room.state.phase === 'finished') {
    // Ordenar jugadores por puntaje
    const sortedPlayers = Object.entries(room.state.scores || {})
      .map(([id, score]) => ({ 
        id, 
        score: score as number, 
        name: playersInfo.find((p: any) => p.id === id)?.nickname || 'Jugador' 
      }))
      .sort((a, b) => b.score - a.score);
      
    const winner = sortedPlayers[0];

    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className={styles.victoryCard}>
          <h1 className={styles.victoryTitle}>¡Juego Terminado!</h1>
          <div className={styles.podium}>
            <div className={styles.winnerAvatar}>👑</div>
            <h2 className={styles.winnerName}>{winner?.name}</h2>
            <p className={styles.winnerScore}>Ganador indiscutible con {winner?.score} puntos</p>
          </div>
          
          <div className={styles.scoreboard}>
            <h3>Marcador Final</h3>
            {sortedPlayers.map((p, idx) => (
              <div key={p.id} className={styles.scoreRow}>
                <span className={styles.scoreRank}>#{idx + 1}</span>
                <span className={styles.scoreName}>{p.name}</span>
                <span className={styles.scorePoints}>{p.score} pts</span>
              </div>
            ))}
          </div>

          {/* Por ahora solo el Host puede reiniciar, o volver al lobby */}
          <button className={styles.submitBtn} onClick={() => window.location.href = '/'}>
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // === PANTALLA DE JUEGO (PLAYING, JUDGING, REVEAL) ===
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.roundInfo}>Ronda {room.state.round}</div>
        <div className={styles.roleInfo}>
          {isCzar ? '👑 Eres el Zar' : `👑 Zar: ${czarName}`}
        </div>
        <div className={styles.scoreDisplay}>
          🏆 {room.state.scores?.[user?.id] || 0} pts
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {room.host_id === user?.id && (
            <button 
              onClick={handleReturnToLobby}
              style={{ padding: '0.4rem 0.8rem', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Cancelar Partida
            </button>
          )}
          <button 
            onClick={handleLeaveGame}
            style={{ padding: '0.4rem 0.8rem', background: 'var(--color-surface-raised)', color: 'white', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Salir
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.boardArea}>
          <GameCard 
            isBlack 
            text={room.state.blackCard?.text || 'Esperando carta...'} 
            pickCount={room.state.blackCard?.pick}
          />
          
          {isCzar && room.state.phase === 'playing' && (!room.state.submittedBy || room.state.submittedBy.length === 0) && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button 
                className={styles.submitBtn} 
                style={{ background: 'var(--color-surface-raised)', border: '1px solid rgba(255,255,255,0.1)' }}
                onClick={async () => {
                  if (!window.confirm("¿Seguro que quieres cambiar la carta negra? Se sacará una nueva.")) return;
                  try {
                    const { data, error } = await supabase.functions.invoke('game-action', {
                      body: { roomId: room.id, action: { type: 'PASS_BLACK_CARD' } }
                    });
                    if (error) throw error;
                    if (data?.error) throw new Error(data.error);
                  } catch (err: any) {
                    alert(err.message || 'Error al cambiar la carta');
                  }
                }}
              >
                Cambiar Carta Negra
              </button>
            </div>
          )}

          {(room.state.phase === 'judging' || room.state.phase === 'reveal') && room.state.submissions && (
            <div className={styles.submissionsArea}>
              <h3>Cartas jugadas</h3>
              <div className={styles.submissionsGrid}>
                {room.state.submissions.map((sub: any) => {
                  const isWinner = room.state.lastWinner?.cards?.[0]?.id === sub.cards?.[0]?.id;
                  return (
                    <div 
                      key={sub.anonId} 
                      className={`${styles.submissionGroup} ${isWinner ? styles.winnerGroup : ''}`}
                      onClick={() => (isCzar && !room.state.lastWinner) ? handlePickWinner(sub.anonId) : undefined}
                      style={{ cursor: (isCzar && !room.state.lastWinner) ? 'pointer' : 'default' }}
                    >
                      {sub.cards.map((c: any) => (
                        <GameCard key={c.id} text={c.text} />
                      ))}
                      {isWinner && <div className={styles.winnerBadge}>👑 GANADOR</div>}
                    </div>
                  );
                })}
              </div>
              
              {isCzar && room.state.lastWinner && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button className={styles.submitBtn} onClick={handleNextRound}>
                    Siguiente Ronda
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {!isCzar && room.state.phase === 'playing' && (
          <section className={styles.handArea}>
            <div className={styles.handHeader}>
              <h3>{hasSubmitted ? 'Esperando a los demás...' : 'Tu Mano'}</h3>
              {!hasSubmitted && <span>Elige {pickCount}</span>}
            </div>
            
            {!hasSubmitted && (
              <>
                <div className={styles.carousel}>
                  {hand?.hand?.map((card: any) => {
                    const selIdx = selectedCards.indexOf(card.id);
                    return (
                      <GameCard 
                        key={card.id} 
                        text={card.text} 
                        selected={selIdx !== -1}
                        selectionOrder={pickCount > 1 && selIdx !== -1 ? selIdx + 1 : undefined}
                        onClick={() => handleCardClick(card.id)}
                      />
                    );
                  })}
                </div>
                
                <div className={styles.actionBar}>
                  <button 
                    className={styles.submitBtn}
                    onClick={handleSubmitCards} 
                    disabled={selectedCards.length !== pickCount || isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : `Jugar ${selectedCards.length}/${pickCount}`}
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
