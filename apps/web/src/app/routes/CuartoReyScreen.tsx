import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import styles from './CuartoReyScreen.module.css';

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const SUIT_COLORS: Record<string, string> = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black'
};

const RULE_DESCRIPTIONS: Record<string, string> = {
  'A': 'Cascada: Todos beben hasta que el de tu derecha pare.',
  '2': 'Dos por ti: Eliges a alguien para que beba.',
  '3': 'Tres por mí: Bebes tú.',
  '4': 'Cuatro al suelo: El último en tocar el suelo bebe.',
  '5': 'Pulgar: Eres el Maestro del Pulgar (Thumb Master).',
  '6': 'Seis para chicos: Beben los hombres.',
  '7': 'Siete al cielo: El último en apuntar al cielo bebe.',
  '8': 'Ocho Mate: Eliges a un compañero que bebe cada vez que tú lo hagas.',
  '9': 'Nueve Rima: Dices una palabra, el que falle la rima bebe.',
  '10': 'Diez Categorías: Dices categoría, el que repita o falle bebe.',
  'J': 'Jota Regla: Inventas una regla que rige por todo el juego.',
  'Q': 'Reina Preguntas: Si alguien te responde una pregunta, bebe.',
  'K': 'Rey de Copas: Echa bebida al vaso central. El 4to Rey se lo toma todo y termina el juego.'
};

export function CuartoReyScreen({ room, user, playersInfo }: any) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [newRule, setNewRule] = useState('');
  
  const isMyTurn = room.state.turnId === user?.id;

  const handleDrawCard = async () => {
    if (!isMyTurn || isDrawing) return;
    setIsDrawing(true);
    try {
      const { data, error } = await supabase.functions.invoke('game-action', {
        body: { roomId: room.id, action: { type: 'DRAW_CARD' } }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    } catch (err: any) {
      alert(err.message || 'Error al sacar carta');
    } finally {
      setIsDrawing(false);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.trim()) return;
    try {
      const { data, error } = await supabase.functions.invoke('game-action', {
        body: { roomId: room.id, action: { type: 'ADD_RULE', ruleText: newRule.trim() } }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setNewRule('');
    } catch (err: any) {
      alert(err.message || 'Error al crear regla');
    }
  };

  const handleLeaveGame = async () => {
    if (!window.confirm("¿Seguro que quieres abandonar la partida?")) return;
    window.location.href = '/';
  };

  const currentTurnName = playersInfo.find((p: any) => p.id === room.state.turnId)?.nickname || 'Alguien';

  if (room.state.phase === 'finished') {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className={styles.victoryCard}>
          <h1>¡Juego Terminado!</h1>
          <h2>¡Se sacó el 4to Rey!</h2>
          <p>Quien haya sacado la última carta debe tomarse el vaso central (El Cáliz del Rey).</p>
          <button className={styles.submitBtn} onClick={() => window.location.href = '/'}>
            Volver al Menú
          </button>
        </div>
      </div>
    );
  }

  const lastCard = room.state.lastDrawnCard;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.turnInfo}>
          {isMyTurn ? '👉 ¡Es tu turno!' : `Turno de: ${currentTurnName}`}
        </div>
        <div className={styles.kingsCount}>
          👑 Reyes: {room.state.kingsDrawn} / 4
        </div>
        <button 
          onClick={handleLeaveGame}
          style={{ padding: '0.4rem 0.8rem', background: 'var(--color-surface-raised)', color: 'white', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          Salir
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.board}>
          <div className={styles.deckArea} onClick={handleDrawCard}>
            {room.state.cardsLeft > 0 ? (
              <motion.div 
                className={styles.cardBack}
                whileHover={isMyTurn ? { scale: 1.05 } : {}}
                whileTap={isMyTurn ? { scale: 0.95 } : {}}
                style={{ cursor: isMyTurn ? 'pointer' : 'default', opacity: isMyTurn ? 1 : 0.5 }}
              >
                <div className={styles.cardBackPattern}></div>
                <div className={styles.cardsLeft}>{room.state.cardsLeft} cartas</div>
                {isMyTurn && <div className={styles.drawPrompt}>Toca para sacar</div>}
              </motion.div>
            ) : (
              <div className={styles.emptyDeck}>Mazo vacío</div>
            )}
          </div>

          <div className={styles.drawnCardArea}>
            {lastCard ? (
              <motion.div 
                className={styles.playingCard}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                key={`${lastCard.rank}-${lastCard.suit}-${room.state.cardsLeft}`}
                style={{ color: SUIT_COLORS[lastCard.suit] }}
              >
                <div className={styles.cardRankTop}>{lastCard.rank} {SUIT_SYMBOLS[lastCard.suit]}</div>
                <div className={styles.cardSuitCenter}>{SUIT_SYMBOLS[lastCard.suit]}</div>
                <div className={styles.cardRankBottom}>{lastCard.rank} {SUIT_SYMBOLS[lastCard.suit]}</div>
              </motion.div>
            ) : (
              <div className={styles.placeholderCard}>Esperando carta...</div>
            )}
          </div>
        </div>

        <div className={styles.ruleDisplay}>
          {lastCard && (
            <div className={styles.ruleBox}>
              <h3>Regla del {lastCard.rank}</h3>
              <p>{RULE_DESCRIPTIONS[lastCard.rank]}</p>
            </div>
          )}

          {lastCard?.rank === 'J' && room.state.lastDrawnPlayerId === user?.id && (
            <form onSubmit={handleAddRule} className={styles.ruleForm}>
              <input 
                type="text" 
                placeholder="Escribe la nueva regla..."
                value={newRule}
                onChange={e => setNewRule(e.target.value)}
                className={styles.ruleInput}
              />
              <button type="submit" className={styles.submitBtn} disabled={!newRule.trim()}>
                Crear Regla
              </button>
            </form>
          )}
        </div>

        <div className={styles.gameInfo}>
          {room.state.thumbMaster && (
            <div className={styles.infoBadge}>
              👍 Maestro del Pulgar: {playersInfo.find((p: any) => p.id === room.state.thumbMaster)?.nickname}
            </div>
          )}
          {room.state.questionMaster && (
            <div className={styles.infoBadge}>
              ❓ Reina de Preguntas: {playersInfo.find((p: any) => p.id === room.state.questionMaster)?.nickname}
            </div>
          )}
          
          {room.state.rules?.length > 0 && (
            <div className={styles.activeRules}>
              <h4>Reglas Activas (J):</h4>
              <ul>
                {room.state.rules.map((r: any, idx: number) => (
                  <li key={idx}>{r.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
