import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { cuartoRey } from '../../games/cuarto-rey/reducer';
import type { CrPublicState, CrSecretState } from '../../games/cuarto-rey/types';
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

export default function CuartoReySolo() {
  const [user, setUser] = useState<any>(null);
  const [state, setState] = useState<{ publicState: CrPublicState, secretState: CrSecretState } | null>(null);
  const [newRule, setNewRule] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        // Iniciar el juego offline
        const setupResult = cuartoRey.setup({
          players: [data.user.id],
          settings: {},
          seed: Date.now().toString()
        });
        
        // Simular inicio del juego
        const startResult = cuartoRey.reduce(
          { ...setupResult },
          { type: 'START_GAME' },
          { actorId: data.user.id, timestamp: Date.now() }
        );

        if (!startResult.error && startResult.publicState) {
          setState({
            publicState: startResult.publicState,
            secretState: startResult.secretState
          });
        }
      }
    });
  }, []);

  if (!state || !user) return <div className={styles.container}>Cargando...</div>;

  const handleDrawCard = () => {
    if (state.publicState.phase !== 'playing') return;
    
    const result = cuartoRey.reduce(
      { publicState: state.publicState, privateState: { [user.id]: {} }, secretState: state.secretState },
      { type: 'DRAW_CARD' },
      { actorId: user.id, timestamp: Date.now() }
    );

    if (!result.error && result.publicState) {
      setState({
        publicState: result.publicState,
        secretState: result.secretState
      });
    }
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.trim()) return;
    
    const result = cuartoRey.reduce(
      { publicState: state.publicState, privateState: { [user.id]: {} }, secretState: state.secretState },
      { type: 'ADD_RULE', ruleText: newRule.trim() },
      { actorId: user.id, timestamp: Date.now() }
    );

    if (!result.error && result.publicState) {
      setState({
        publicState: result.publicState,
        secretState: result.secretState
      });
      setNewRule('');
    }
  };

  const handleRestart = () => {
    const setupResult = cuartoRey.setup({
      players: [user.id],
      settings: {},
      seed: Date.now().toString()
    });
    
    const startResult = cuartoRey.reduce(
      { ...setupResult },
      { type: 'START_GAME' },
      { actorId: user.id, timestamp: Date.now() }
    );

    if (!startResult.error && startResult.publicState) {
      setState({
        publicState: startResult.publicState,
        secretState: startResult.secretState
      });
    }
  };

  if (state.publicState.phase === 'finished') {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className={styles.victoryCard}>
          <h1>¡Juego Terminado!</h1>
          <h2>¡Salió el 4to Rey!</h2>
          <p>Tómate el vaso central.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <button className={styles.submitBtn} onClick={handleRestart}>
              Jugar de nuevo
            </button>
            <button className={styles.submitBtn} onClick={() => window.location.href = '/'}>
              Volver al Menú
            </button>
          </div>
        </div>
      </div>
    );
  }

  const lastCard = state.publicState.lastDrawnCard;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.turnInfo}>
          <span style={{ color: '#10b981', fontSize: '0.8rem', padding: '2px 6px', border: '1px solid #10b981', borderRadius: '12px', marginRight: '8px' }}>OFFLINE</span>
          Modo Solitario
        </div>
        <div className={styles.kingsCount}>
          👑 Reyes: {state.publicState.kingsDrawn} / 4
        </div>
        <button 
          onClick={() => window.location.href = '/lobby'}
          style={{ padding: '0.4rem 0.8rem', background: 'var(--color-surface-raised)', color: 'white', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          Salir
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.board}>
          <div className={styles.deckArea} onClick={handleDrawCard}>
            {state.publicState.cardsLeft > 0 ? (
              <motion.div 
                className={styles.cardBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.cardBackPattern}></div>
                <div className={styles.cardsLeft}>{state.publicState.cardsLeft} cartas</div>
                <div className={styles.drawPrompt}>Toca para sacar</div>
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
                key={`${lastCard.rank}-${lastCard.suit}-${state.publicState.cardsLeft}`}
                style={{ color: SUIT_COLORS[lastCard.suit] }}
              >
                <div className={styles.cardRankTop}>{lastCard.rank} {SUIT_SYMBOLS[lastCard.suit]}</div>
                <div className={styles.cardSuitCenter}>{SUIT_SYMBOLS[lastCard.suit]}</div>
                <div className={styles.cardRankBottom}>{lastCard.rank} {SUIT_SYMBOLS[lastCard.suit]}</div>
              </motion.div>
            ) : (
              <div className={styles.placeholderCard}>Toca el mazo para empezar...</div>
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

          {lastCard?.rank === 'J' && (
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
          {state.publicState.rules?.length > 0 && (
            <div className={styles.activeRules}>
              <h4>Reglas Activas (J):</h4>
              <ul>
                {state.publicState.rules.map((r: any, idx: number) => (
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
