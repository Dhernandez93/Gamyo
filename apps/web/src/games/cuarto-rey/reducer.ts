import type { CrAction, CrPrivateState, CrPublicState, CrSecretState, PlayingCard, Rank, Suit } from "./types.ts";

export const CUARTO_REY_ID = 'cuarto-rey';

// Helper for deterministic shuffling
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function shuffle<T>(array: T[], prng: () => number): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function createDeck(): PlayingCard[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: PlayingCard[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

export const cuartoRey = {
  id: CUARTO_REY_ID,
  minPlayers: 2,
  maxPlayers: 20,
  defaultSettings: {},

  setup(ctx: any) {
    const publicState: CrPublicState = {
      phase: 'lobby',
      turnId: null,
      direction: 1,
      lastDrawnCard: null,
      lastDrawnPlayerId: null,
      kingsDrawn: 0,
      questionMaster: null,
      thumbMaster: null,
      rules: [],
      cardsLeft: 52
    };

    const privateState: Record<string, CrPrivateState> = {};
    for (const p of ctx.players) {
      privateState[p] = {};
    }

    let seedNum = 0;
    for(let i=0; i<ctx.seed.length; i++) seedNum += ctx.seed.charCodeAt(i);
    const prng = mulberry32(seedNum);

    const secretState: CrSecretState = {
      deck: shuffle(createDeck(), prng),
      rngSeed: ctx.seed
    };

    return { publicState, privateState, secretState };
  },

  reduce(state: any, action: CrAction, ctx: any) {
    const { publicState, privateState, secretState } = state;
    
    // Safety check on players array which might be injected dynamically
    const players = publicState.players ? publicState.players.map((p: any) => p.id) : Object.keys(privateState);

    switch (action.type) {
      case 'START_GAME': {
        if (publicState.phase !== 'lobby' && publicState.phase !== 'finished') {
          return { error: 'Juego ya iniciado' };
        }
        
        let seedNum = Date.now();
        const prng = mulberry32(seedNum);
        
        publicState.phase = 'playing';
        publicState.turnId = players[0];
        publicState.direction = 1;
        publicState.lastDrawnCard = null;
        publicState.lastDrawnPlayerId = null;
        publicState.kingsDrawn = 0;
        publicState.questionMaster = null;
        publicState.thumbMaster = null;
        publicState.rules = [];
        secretState.deck = shuffle(createDeck(), prng);
        publicState.cardsLeft = secretState.deck.length;

        return { publicState, privateState, secretState };
      }

      case 'DRAW_CARD': {
        if (publicState.phase !== 'playing') return { error: 'El juego no está activo' };
        if (ctx.actorId !== publicState.turnId) return { error: 'No es tu turno' };
        if (secretState.deck.length === 0) return { error: 'No quedan cartas' };

        const card = secretState.deck.pop()!;
        publicState.cardsLeft = secretState.deck.length;
        publicState.lastDrawnCard = card;
        publicState.lastDrawnPlayerId = ctx.actorId;

        // Apply rules
        if (card.rank === 'K') {
          publicState.kingsDrawn++;
          if (publicState.kingsDrawn === 4) {
            publicState.phase = 'finished';
            return { publicState, privateState, secretState };
          }
        } else if (card.rank === 'Q') {
          publicState.questionMaster = ctx.actorId;
        } else if (card.rank === '5') {
          publicState.thumbMaster = ctx.actorId;
        } else if (card.rank === '8') {
          // Mate logic could be manual
        }

        // Advance turn
        const currentIndex = players.indexOf(publicState.turnId);
        let nextIndex = currentIndex + publicState.direction;
        if (nextIndex < 0) nextIndex = players.length - 1;
        if (nextIndex >= players.length) nextIndex = 0;
        
        // Ensure the player is still in the game
        publicState.turnId = players[nextIndex];

        return { publicState, privateState, secretState };
      }

      case 'ADD_RULE': {
        if (publicState.phase !== 'playing') return { error: 'El juego no está activo' };
        if (publicState.lastDrawnPlayerId !== ctx.actorId) return { error: 'Solo quien sacó la J puede crear una regla' };
        if (publicState.lastDrawnCard?.rank !== 'J') return { error: 'No sacaste una J' };

        publicState.rules.push({
          authorId: ctx.actorId,
          text: action.ruleText
        });

        return { publicState, privateState, secretState };
      }

      case 'RESTART_GAME': {
        if (publicState.phase !== 'finished') return { error: 'Aún no termina el juego' };
        publicState.phase = 'lobby';
        return { publicState, privateState, secretState };
      }

      default:
        return { error: 'Acción desconocida' };
    }
  }
};
