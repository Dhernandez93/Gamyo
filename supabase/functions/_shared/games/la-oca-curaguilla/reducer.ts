import type { ActionCtx, FullState, GameDefinition, PlayerId, SetupCtx } from "../../engine/types.ts";
import type { 
  OcaAction, 
  OcaCard, 
  OcaPlayer, 
  OcaPrivateState, 
  OcaPublicState, 
  OcaSecretState, 
  OcaSettings, 
  TileInfo 
} from "./types.ts";
import { OCA_CARDS } from "./cards.ts";

export const OCA_GAME_ID = 'la-oca-curaguilla';

const PLAYER_COLORS = [
  '#ef4444', // Rojo
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#f59e0b', // Amarillo
  '#8b5cf6', // Morado
  '#ec4899', // Rosa
  '#06b6d4', // Celeste
  '#f97316'  // Naranja
];

function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function shuffle<T>(array: T[], prng: () => number): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function generateBoardTiles(boardSize: number = 50): TileInfo[] {
  const tiles: TileInfo[] = [];
  for (let i = 1; i <= boardSize; i++) {
    if (i === 1) {
      tiles.push({ index: i, type: 'safe', label: 'Salida' });
    } else if (i === 6) {
      tiles.push({ index: i, type: 'shortcut', label: 'Atajo al 10 (+2 sorbos)', targetIndex: 10, sips: 2 });
    } else if (i === 13) {
      tiles.push({ index: i, type: 'trap', label: 'Resbalón al 9 (+2 sorbos)', targetIndex: 9, sips: 2 });
    } else if (i === 19) {
      tiles.push({ index: i, type: 'cascade', label: '¡Cascada de Copete!' });
    } else if (i === 24) {
      tiles.push({ index: i, type: 'safe', label: 'El Bajón (Descanso)' });
    } else if (i === 30) {
      tiles.push({ index: i, type: 'shortcut', label: 'Atajo al 35 (+3 sorbos)', targetIndex: 35, sips: 3 });
    } else if (i === 37) {
      tiles.push({ index: i, type: 'trap', label: 'Resbalón al 31 (+3 sorbos)', targetIndex: 31, sips: 3 });
    } else if (i === 42) {
      tiles.push({ index: i, type: 'cascade', label: '¡Cascada Monumental!' });
    } else if (i === 47) {
      tiles.push({ index: i, type: 'trap', label: 'Trampa del Curagüilla (al 40)', targetIndex: 40, sips: 4 });
    } else if (i === boardSize) {
      tiles.push({ index: i, type: 'finish', label: 'El Cáliz del Rey' });
    } else {
      tiles.push({ index: i, type: 'normal' });
    }
  }
  return tiles;
}

export const laOcaCuraguilla: GameDefinition<OcaPublicState, OcaPrivateState, OcaSecretState, OcaAction, OcaSettings> = {
  id: OCA_GAME_ID,
  minPlayers: 2,
  maxPlayers: 12,
  defaultSettings: {
    enabledLevels: [1, 2],
    boardSize: 50,
    penaltyType: 'fondo_blanco'
  },

  setup(ctx: SetupCtx<OcaSettings>) {
    const settings: OcaSettings = {
      enabledLevels: ctx.settings?.enabledLevels?.length ? ctx.settings.enabledLevels : [1, 2],
      boardSize: ctx.settings?.boardSize || 50,
      penaltyType: ctx.settings?.penaltyType || 'fondo_blanco'
    };

    const tiles = generateBoardTiles(settings.boardSize);
    const players: OcaPlayer[] = ctx.players.map((id, idx) => ({
      id,
      position: 1,
      sipsTaken: 0,
      timesChickened: 0,
      color: PLAYER_COLORS[idx % PLAYER_COLORS.length]
    }));

    let seedNum = 0;
    for (let i = 0; i < ctx.seed.length; i++) seedNum += ctx.seed.charCodeAt(i);
    const prng = mulberry32(seedNum || Date.now());

    // Filtrar mazo según los niveles habilitados
    const availableCards = OCA_CARDS.filter(c => settings.enabledLevels.includes(c.level));
    const deck = shuffle(availableCards.length > 0 ? availableCards : OCA_CARDS, prng);

    const publicState: OcaPublicState = {
      gameId: OCA_GAME_ID,
      phase: 'lobby',
      settings,
      boardSize: settings.boardSize,
      tiles,
      players,
      turnIndex: 0,
      turnPlayerId: null,
      lastDiceRoll: null,
      currentEvent: null,
      activeCurses: [],
      winnerId: null,
      round: 1
    };

    const privateState: Record<PlayerId, OcaPrivateState> = {};
    for (const p of ctx.players) {
      privateState[p] = {};
    }

    const secretState: OcaSecretState = {
      deck,
      usedCardIds: []
    };

    return { publicState, privateState, secretState };
  },

  reduce(state: FullState<OcaPublicState, OcaPrivateState, OcaSecretState>, action: OcaAction, ctx: ActionCtx) {
    const { publicState, privateState, secretState } = state;
    
    // Asegurar players actualizado desde publicState
    const players = publicState.players;

    switch (action.type) {
      case 'START_GAME': {
        if (publicState.phase !== 'lobby' && publicState.phase !== 'finished') {
          return { error: 'Juego ya iniciado' };
        }

        const prng = mulberry32(Date.now());
        const availableCards = OCA_CARDS.filter(c => publicState.settings.enabledLevels.includes(c.level));
        secretState.deck = shuffle(availableCards.length > 0 ? availableCards : OCA_CARDS, prng);
        secretState.usedCardIds = [];

        publicState.phase = 'playing';
        publicState.turnIndex = 0;
        publicState.turnPlayerId = players[0]?.id || ctx.actorId;
        publicState.lastDiceRoll = null;
        publicState.currentEvent = null;
        publicState.activeCurses = [];
        publicState.winnerId = null;
        publicState.round = 1;

        // Reset positions
        publicState.players = players.map(p => ({
          ...p,
          position: 1,
          sipsTaken: 0,
          timesChickened: 0
        }));

        return { publicState, privateState, secretState };
      }

      case 'ROLL_DICE': {
        if (publicState.phase !== 'playing') {
          return { error: 'El juego no está en espera de tirada de dados' };
        }
        if (ctx.actorId !== publicState.turnPlayerId) {
          return { error: 'No es tu turno de tirar los dados' };
        }

        // Tirar 1D6
        const roll = Math.floor(Math.random() * 6) + 1;
        publicState.lastDiceRoll = roll;

        const currentPlayer = players[publicState.turnIndex];
        let targetPosition = currentPlayer.position + roll;

        // Limitar a casilla final
        if (targetPosition >= publicState.boardSize) {
          targetPosition = publicState.boardSize;
          currentPlayer.position = targetPosition;
          publicState.winnerId = currentPlayer.id;
          publicState.phase = 'finished';
          return { publicState, privateState, secretState };
        }

        currentPlayer.position = targetPosition;
        const currentTile = publicState.tiles.find(t => t.index === targetPosition);

        // Evaluar tipo de casilla
        if (currentTile?.type === 'shortcut' && currentTile.targetIndex) {
          currentPlayer.position = currentTile.targetIndex;
          currentPlayer.sipsTaken += (currentTile.sips || 2);
          publicState.currentEvent = {
            id: 'shortcut_event',
            level: 1,
            type: 'individual',
            title: '⚡ ¡Atajo Carretero!',
            description: `Avanzas directamente a la casilla ${currentTile.targetIndex}. Pagas un peaje de ${currentTile.sips || 2} sorbos.`,
            sips: currentTile.sips || 2,
            penaltySips: 0
          };
          publicState.phase = 'event_active';
        } else if (currentTile?.type === 'trap' && currentTile.targetIndex) {
          currentPlayer.position = currentTile.targetIndex;
          currentPlayer.sipsTaken += (currentTile.sips || 2);
          publicState.currentEvent = {
            id: 'trap_event',
            level: 1,
            type: 'individual',
            title: '🕳️ ¡Resbalón con Piscola!',
            description: `Te resbalas torpemente y caes a la casilla ${currentTile.targetIndex}. Castigo: te tomas ${currentTile.sips || 2} sorbos.`,
            sips: currentTile.sips || 2,
            penaltySips: 0
          };
          publicState.phase = 'event_active';
        } else if (currentTile?.type === 'cascade') {
          publicState.currentEvent = {
            id: 'cascade_event',
            level: 1,
            type: 'group',
            title: '🍻 ¡CASCADA MONUMENTAL!',
            description: `Todos los jugadores empiezan a tomar al mismo tiempo que tú. Nadie puede parar hasta que tú dejes tu vaso en la mesa.`,
            sips: 3,
            penaltySips: 5
          };
          publicState.phase = 'event_active';
        } else if (currentTile?.type === 'safe') {
          publicState.currentEvent = {
            id: 'safe_event',
            level: 1,
            type: 'individual',
            title: '🍔 El Bajón (Zona Segura)',
            description: 'Llegaste a la picada de completos y papas fritas. Descanso merecido: no tomas ni haces penitencias este turno.',
            sips: 0,
            penaltySips: 0
          };
          publicState.phase = 'event_active';
        } else {
          // Casilla normal: sacar carta del mazo
          if (secretState.deck.length === 0) {
            const prng = mulberry32(Date.now());
            const availableCards = OCA_CARDS.filter(c => publicState.settings.enabledLevels.includes(c.level));
            secretState.deck = shuffle(availableCards.length > 0 ? availableCards : OCA_CARDS, prng);
          }

          const card = secretState.deck.pop()!;
          secretState.usedCardIds.push(card.id);
          publicState.currentEvent = card;
          publicState.phase = 'event_active';
        }

        return { publicState, privateState, secretState };
      }

      case 'RESOLVE_EVENT': {
        if (publicState.phase !== 'event_active') {
          return { error: 'No hay evento pendiente de resolución' };
        }

        const currentPlayer = players[publicState.turnIndex];
        const event = publicState.currentEvent;

        if (event) {
          if (action.success) {
            // Cumplió el reto
            currentPlayer.sipsTaken += event.sips;
            
            // Si era una maldición, añadir a activeCurses
            if (event.type === 'curse') {
              publicState.activeCurses.push({
                id: event.id + '_' + Date.now(),
                playerId: currentPlayer.id,
                title: event.title,
                description: event.description,
                expiresOnRound: publicState.round + 2
              });
            }
          } else {
            // Arrugó: aplicar castigo universal
            const penalty = event.penaltySips || 5;
            currentPlayer.sipsTaken += penalty;
            currentPlayer.timesChickened += 1;
          }
        }

        // Avanzar de turno
        const nextIndex = (publicState.turnIndex + 1) % players.length;
        if (nextIndex === 0) {
          publicState.round += 1;
          // Limpiar maldiciones vencidas
          publicState.activeCurses = publicState.activeCurses.filter(
            c => c.expiresOnRound > publicState.round
          );
        }

        publicState.turnIndex = nextIndex;
        publicState.turnPlayerId = players[nextIndex].id;
        publicState.phase = 'playing';
        publicState.currentEvent = null;

        return { publicState, privateState, secretState };
      }

      case 'RESTART_GAME': {
        publicState.phase = 'lobby';
        publicState.winnerId = null;
        publicState.currentEvent = null;
        return { publicState, privateState, secretState };
      }

      case 'RETURN_TO_LOBBY': {
        publicState.phase = 'lobby';
        publicState.winnerId = null;
        publicState.currentEvent = null;
        return { publicState, privateState, secretState };
      }

      default:
        return { error: 'Acción no soportada en La Oca Curagüilla' };
    }
  }
};
