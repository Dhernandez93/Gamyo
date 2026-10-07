import { PublicGameState, SecretGameState, GameAction, Card } from './types';

// Mezcla un array usando Fisher-Yates (puro si usamos una semilla o si ignoramos impurezas para simplicidad, 
// pero usualmente deberíamos pasar random seed, por ahora usaremos Math.random ya que corre en el backend)
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function gameReducer(
  publicState: PublicGameState,
  secretState: SecretGameState,
  hands: Record<string, Card[]>, // playerId -> cards
  action: GameAction
): { publicState: PublicGameState, secretState: SecretGameState, hands: Record<string, Card[]> } {
  
  // Clones para mutar de forma segura
  const newPublic = { ...publicState };
  const newSecret = { ...secretState };
  const newHands = { ...hands };

  switch (action.type) {
    case 'START_GAME': {
      newPublic.phase = 'playing';
      newSecret.drawPileWhite = shuffle(action.payload.whiteCards);
      newSecret.drawPileBlack = shuffle(action.payload.blackCards);
      newSecret.playedCards = [];
      newPublic.revealedCards = [];
      newPublic.playedCardsCount = 0;
      
      // Select first czar
      newPublic.czarId = newPublic.players[0].id;
      
      // Draw black card
      newPublic.currentBlackCard = newSecret.drawPileBlack.pop() || null;

      // Deal 10 cards to each player
      for (const p of newPublic.players) {
        newHands[p.id] = newSecret.drawPileWhite.splice(0, 10);
        p.hasPlayed = false;
        p.score = 0;
      }
      break;
    }

    case 'PLAY_CARD': {
      if (newPublic.phase !== 'playing') throw new Error('Not playing phase');
      if (newPublic.czarId === action.payload.playerId) throw new Error('Czar cannot play cards');
      
      const p = newPublic.players.find(p => p.id === action.payload.playerId);
      if (!p) throw new Error('Player not found');
      if (p.hasPlayed) throw new Error('Player already played');

      // Verify player has the cards
      const playerHand = newHands[action.payload.playerId] || [];
      const playCardIds = action.payload.cards.map(c => c.id);
      
      // Remove cards from hand
      newHands[action.payload.playerId] = playerHand.filter(c => !playCardIds.includes(c.id));

      newSecret.playedCards.push({
        playerId: action.payload.playerId,
        cards: action.payload.cards
      });

      p.hasPlayed = true;
      newPublic.playedCardsCount++;

      // Check if everyone has played (except czar)
      if (newPublic.playedCardsCount === newPublic.players.length - 1) {
        // Automatically reveal cards? O dejamos que el zar lo haga? 
        // Normalmente el Zar apreta "Revelar".
        // Lo dejaremos en que la phase cambia a 'revealing' y mostramos el botón
        newPublic.phase = 'revealing';
      }
      break;
    }

    case 'REVEAL_CARDS': {
      if (newPublic.phase !== 'revealing' && newPublic.playedCardsCount === newPublic.players.length - 1) {
         newPublic.phase = 'revealing';
      }
      
      if (newPublic.phase !== 'revealing') throw new Error('Cannot reveal cards yet');
      
      // Move secret playedCards to public revealedCards, shuffled so we don't know who is who!
      newPublic.revealedCards = shuffle([...newSecret.playedCards]);
      newSecret.playedCards = []; // clear secret
      break;
    }

    case 'CHOOSE_WINNER': {
      if (newPublic.phase !== 'revealing') throw new Error('Must reveal cards first');
      
      // The czar chose a winner
      const winnerId = action.payload.playerId;
      const winner = newPublic.players.find(p => p.id === winnerId);
      if (winner) {
        winner.score++;
      }
      
      newPublic.winnerId = winnerId;
      
      // Check if game ended
      if (winner && winner.score >= newPublic.settings.scoreToWin) {
        newPublic.phase = 'finished';
      } else {
        newPublic.phase = 'starting'; // Next round transition state
      }
      break;
    }

    case 'PASS_BLACK_CARD': {
      // The Zar can skip the black card
      if (newPublic.phase !== 'playing') throw new Error('Can only pass during playing');
      if (newPublic.playedCardsCount > 0) throw new Error('Cannot pass if someone already played');
      
      // Draw new black card
      if (newSecret.drawPileBlack.length === 0) throw new Error('No more black cards');
      newPublic.currentBlackCard = newSecret.drawPileBlack.pop() || null;
      break;
    }

    case 'NEXT_ROUND': {
      if (newPublic.phase !== 'starting') throw new Error('Cannot go to next round');
      
      newPublic.phase = 'playing';
      newPublic.winnerId = null;
      newPublic.revealedCards = [];
      newPublic.playedCardsCount = 0;
      
      // Rotate czar
      const currentCzarIndex = newPublic.players.findIndex(p => p.id === newPublic.czarId);
      const nextCzarIndex = (currentCzarIndex + 1) % newPublic.players.length;
      newPublic.czarId = newPublic.players[nextCzarIndex].id;
      
      // Draw new black card
      if (newSecret.drawPileBlack.length === 0) throw new Error('No more black cards');
      newPublic.currentBlackCard = newSecret.drawPileBlack.pop() || null;

      // Deal cards to players to reach 10
      for (const p of newPublic.players) {
        p.hasPlayed = false;
        if (p.id === newPublic.czarId) continue;
        
        const hand = newHands[p.id] || [];
        const needed = 10 - hand.length;
        if (needed > 0) {
          const drawn = newSecret.drawPileWhite.splice(0, needed);
          newHands[p.id] = [...hand, ...drawn];
        }
      }

      break;
    }
  }

  return { publicState: newPublic, secretState: newSecret, hands: newHands };
}
