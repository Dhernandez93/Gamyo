import { ActionCtx, FullState, GameDefinition, PlayerId, SetupCtx } from "../../engine/types.ts";
import { HdnAction, HdnPrivateState, HdnPublicState, HdnSecretState, HdnSettings, WhiteCard, BlackCard } from "./types.ts";

export const HDN_GAME_ID = 'hora-del-nache';

// Helper for deterministic shuffling
// We use a simple Mulberry32 PRNG
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

function generateAnonId(prng: () => number): string {
  return Math.random().toString(36).substring(2, 8); // simple string for UI
}

function drawCards<T>(deck: T[], count: number, prng: () => number): { drawn: T[], remaining: T[] } {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
}

export const horaDelNache: GameDefinition<HdnPublicState, HdnPrivateState, HdnSecretState, HdnAction, HdnSettings> = {
  id: HDN_GAME_ID,
  minPlayers: 3,
  maxPlayers: 12,
  defaultSettings: {
    scoreToWin: 7,
    handSize: 10,
    judgingTime: 45,
    playingTime: 60,
    blanksPerPlayer: 0,
  },

  setup(ctx: SetupCtx<HdnSettings>) {
    // Note: The caller MUST pre-populate secretState with cards.
    // Since setup() signature expects us to return FullState, we will return an empty state
    // and let the caller inject the decks, OR we assume the caller injects them later.
    // For purity, we will just return empty arrays and rely on the Edge Function to seed them 
    // by manually patching secretState right after setup().
    const publicState: HdnPublicState = {
      phase: 'lobby',
      round: 0,
      czarId: null,
      blackCard: null,
      submittedBy: [],
      submissions: null,
      scores: {},
      pileCount: { black: 0, white: 0 },
    };
    
    const privateState: Record<PlayerId, HdnPrivateState> = {};
    for (const p of ctx.players) {
      publicState.scores[p] = 0;
      privateState[p] = { hand: [], blanksLeft: ctx.settings.blanksPerPlayer };
    }

    const secretState: HdnSecretState = {
      whiteDeck: [],
      blackDeck: [],
      discardWhite: [],
      discardBlack: [],
      anonMap: {},
      rngSeed: ctx.seed,
    };

    return { publicState, privateState, secretState };
  },

  reduce(state: FullState<HdnPublicState, HdnPrivateState, HdnSecretState>, action: HdnAction, ctx: ActionCtx) {
    const { publicState, privateState, secretState } = state;

    console.log("==> REDUCER ACTION:", action.type);
    console.log("==> REDUCER PUBLIC STATE:", JSON.stringify(publicState));

    // Simple PRNG instance based on a hash of the seed and round (in a real app, keep state updated)
    // We will just use the length of discard as a mutating factor for simplicity here
    let seedNum = 0;
    for(let i=0; i<secretState.rngSeed.length; i++) seedNum += secretState.rngSeed.charCodeAt(i);
    const prng = mulberry32(seedNum + publicState.round + secretState.discardBlack.length);

    switch (action.type) {
      case 'START_GAME':
      case 'NEXT_ROUND': {
        if (publicState.phase !== 'lobby' && publicState.phase !== 'reveal') {
          return { error: 'No se puede empezar ronda en esta fase' };
        }

        const players = Object.keys(privateState);
        if (players.length < 3) return { error: 'Se necesitan al menos 3 jugadores' };

        // Rotation of czar
        let nextCzarIndex = 0;
        if (publicState.czarId) {
          const currentIndex = players.indexOf(publicState.czarId);
          nextCzarIndex = (currentIndex + 1) % players.length;
        }
        const newCzar = players[nextCzarIndex];

        // Refill decks if needed (simplified: assuming decks have enough cards)
        // In reality, we should shuffle discard pile into deck if empty
        
        const { drawn: blackDrawn, remaining: blackRem } = drawCards(secretState.blackDeck, 1, prng);
        if (blackDrawn.length === 0) return { error: 'No hay más cartas negras' };
        
        const currentBlack = blackDrawn[0];
        secretState.blackDeck = blackRem;
        
        // Refill hands
        for (const p of players) {
          const pState = privateState[p];
          // remove submitted cards
          pState.submitted = undefined;
          
          const needed = 10 - pState.hand.length;
          if (needed > 0) {
            const { drawn, remaining } = drawCards(secretState.whiteDeck, needed, prng);
            pState.hand.push(...drawn);
            secretState.whiteDeck = remaining;
          }
        }

        publicState.phase = 'dealing';
        publicState.round += 1;
        publicState.czarId = newCzar;
        publicState.blackCard = currentBlack;
        publicState.submittedBy = [];
        publicState.submissions = null;
        publicState.lastWinner = undefined;
        secretState.anonMap = {};

        // Transition immediately to playing
        publicState.phase = 'playing';

        return { publicState, privateState, secretState };
      }

      case 'PLAY_CARDS': {
        if (publicState.phase !== 'playing') return { error: 'No es momento de jugar cartas' };
        if (ctx.actorId === publicState.czarId) return { error: 'El Zar no puede jugar cartas' };
        if (publicState.submittedBy.includes(ctx.actorId)) return { error: 'Ya jugaste' };

        const requiredCards = publicState.blackCard?.pick || 1;
        if (action.cards.length !== requiredCards) return { error: `Debes jugar ${requiredCards} cartas` };

        // Ensure user actually has these cards (omitted for brevity in this prototype, 
        // but should verify action.cards exist in privateState[ctx.actorId].hand)

        privateState[ctx.actorId].submitted = action.cards;
        // Remove from hand
        const cardIds = action.cards.map(c => c.id);
        privateState[ctx.actorId].hand = privateState[ctx.actorId].hand.filter(c => !cardIds.includes(c.id));
        
        publicState.submittedBy.push(ctx.actorId);

        // Check if everyone played
        const players = Object.keys(privateState);
        const playingPlayers = players.filter(p => p !== publicState.czarId);
        
        if (publicState.submittedBy.length === playingPlayers.length) {
          // Everyone played! Move to judging
          publicState.phase = 'judging';
          
          const rawSubmissions = playingPlayers.map(p => {
            const anonId = generateAnonId(prng);
            secretState.anonMap[anonId] = p;
            return { anonId, cards: privateState[p].submitted! };
          });
          
          publicState.submissions = shuffle(rawSubmissions, prng);
        }

        return { publicState, privateState, secretState };
      }

      case 'PICK_WINNER': {
        if (publicState.phase !== 'judging') return { error: 'No es momento de juzgar' };
        if (ctx.actorId !== publicState.czarId) return { error: 'Solo el Zar puede elegir' };

        const winnerId = secretState.anonMap[action.anonId];
        if (!winnerId) return { error: 'Respuesta inválida' };

        // Increment score
        publicState.scores[winnerId] = (publicState.scores[winnerId] || 0) + 1;

        // Discard all played cards
        secretState.discardBlack.push(publicState.blackCard!);
        for (const sub of publicState.submissions!) {
          secretState.discardWhite.push(...sub.cards);
        }

        publicState.lastWinner = {
          playerId: winnerId,
          cards: publicState.submissions!.find(s => s.anonId === action.anonId)!.cards,
          blackCard: publicState.blackCard!
        };

        publicState.phase = 'reveal';

        // Check for win condition
        // Assume default scoreToWin is 7 for now
        if (publicState.scores[winnerId] >= 7) {
          publicState.phase = 'finished';
        }

        return { publicState, privateState, secretState };
      }

      case 'NEXT_ROUND': {
        if (publicState.phase !== 'reveal') return { error: 'No es momento de iniciar nueva ronda' };
        if (ctx.actorId !== publicState.czarId) return { error: 'Solo el Zar puede avanzar la ronda' };

        // Pasar al siguiente Zar
        const players = Object.keys(privateState).filter(p => !publicState.standby?.includes(p));
        const czarIndex = players.indexOf(publicState.czarId!);
        const newCzar = players[(czarIndex + 1) % players.length];
        
        const { drawn: blackDrawn, remaining: blackRem } = drawCards(secretState.blackDeck, 1, prng);
        if (blackDrawn.length === 0) return { error: 'No hay más cartas negras' }; // Pendiente: reshuffle
        
        const currentBlack = blackDrawn[0];
        secretState.blackDeck = blackRem;
        
        // Rellenar manos
        for (const p of players) {
          const pState = privateState[p];
          pState.submitted = undefined;
          
          const needed = 10 - pState.hand.length;
          if (needed > 0) {
            const { drawn, remaining } = drawCards(secretState.whiteDeck, needed, prng);
            pState.hand.push(...drawn);
            secretState.whiteDeck = remaining;
          }
        }

        publicState.phase = 'playing';
        publicState.round += 1;
        publicState.czarId = newCzar;
        publicState.blackCard = currentBlack;
        publicState.submittedBy = [];
        publicState.submissions = null;
        publicState.lastWinner = undefined;
        secretState.anonMap = {};

        return { publicState, privateState, secretState };
      }

      case 'RETURN_TO_LOBBY': {
        publicState.phase = 'lobby';
        publicState.round = 0;
        publicState.czarId = undefined;
        publicState.blackCard = undefined;
        publicState.submittedBy = [];
        publicState.submissions = null;
        publicState.lastWinner = undefined;
        publicState.standby = [];
        publicState.scores = {};
        return { publicState, privateState, secretState };
      }

      case 'LEAVE_GAME': {
        const leavingPlayer = ctx.actorId;
        
        // Remover de la lista general de jugadores
        if (publicState.players) {
          publicState.players = publicState.players.filter((p: any) => p.id !== leavingPlayer);
        }

        // Si estamos en lobby o no ha empezado, no pasa mucho más
        if (publicState.phase === 'lobby' || publicState.phase === 'finished') {
          return { publicState, privateState, secretState };
        }

        // Remover mano
        delete privateState[leavingPlayer];

        // Remover de submittedBy
        if (publicState.submittedBy) {
          publicState.submittedBy = publicState.submittedBy.filter((id: string) => id !== leavingPlayer);
        }

        // Si el jugador era el Zar, avanzar la ronda (anulando jugadas actuales)
        if (publicState.czarId === leavingPlayer) {
          // Revolvemos las cartas jugadas y cancelamos ronda actual si estaba en playing o judging
          const players = Object.keys(privateState).filter(p => !publicState.standby?.includes(p));
          if (players.length > 0) {
            const czarIndex = Math.floor(prng() * players.length);
            publicState.czarId = players[czarIndex];
            
            // Refill hands for others (ignoring what they submitted this round)
            for (const p of players) {
              const pState = privateState[p];
              pState.submitted = undefined;
              const needed = 10 - pState.hand.length;
              if (needed > 0) {
                // simple draw logic duplicate...
                const drawCount = Math.min(needed, secretState.whiteDeck.length);
                const drawn = secretState.whiteDeck.slice(0, drawCount);
                secretState.whiteDeck = secretState.whiteDeck.slice(drawCount);
                pState.hand.push(...drawn);
              }
            }
            publicState.submittedBy = [];
            publicState.submissions = null;
            publicState.phase = 'playing'; // Reinicia esta fase
          } else {
            publicState.phase = 'lobby';
          }
        } else {
          // Si no era el Zar, y estaba en playing, revisemos si ahora con su partida, ya todos enviaron
          const players = Object.keys(privateState);
          const playingPlayers = players.filter(p => p !== publicState.czarId && !publicState.standby?.includes(p));
          
          if (publicState.phase === 'playing' && publicState.submittedBy.length === playingPlayers.length && playingPlayers.length > 0) {
            publicState.phase = 'judging';
            const rawSubmissions = playingPlayers.map(p => {
              const anonId = 'anon_' + Math.floor(prng() * 10000);
              secretState.anonMap[anonId] = p;
              return { anonId, cards: privateState[p].submitted! };
            });
            publicState.submissions = rawSubmissions; // Omitimos shuffle puro por simplicidad acá
          }
        }
        
        return { publicState, privateState, secretState };
      }

      default:
        return { error: 'Acción desconocida' };
    }
  }
};
