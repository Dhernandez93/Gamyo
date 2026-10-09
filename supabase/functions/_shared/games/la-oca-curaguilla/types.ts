import type { PlayerId } from "../../engine/types.ts";

export type OcaEventType = 'individual' | 'duel' | 'vote' | 'group' | 'curse';

export type TileType = 'normal' | 'shortcut' | 'trap' | 'cascade' | 'safe' | 'finish';

export interface TileInfo {
  index: number;
  type: TileType;
  label?: string;
  targetIndex?: number; // Para atajos o trampas
  sips?: number;
}

export interface OcaCard {
  id: string;
  level: number; // 1, 2, 3, 4
  type: OcaEventType;
  title: string;
  description: string;
  sips: number;
  penaltySips: number;
  tags?: string[];
}

export interface OcaPlayer {
  id: PlayerId;
  position: number;
  sipsTaken: number;
  timesChickened: number;
  color: string;
}

export interface OcaSettings {
  enabledLevels: number[]; // e.g. [1, 2] o [1, 2, 3, 4]
  boardSize: number;       // default 50
  penaltyType: 'fondo_blanco' | 'cinco_sorbos';
}

export interface OcaCurse {
  id: string;
  playerId: PlayerId;
  title: string;
  description: string;
  expiresOnRound: number;
}

export interface OcaPublicState {
  gameId: string;
  phase: 'lobby' | 'playing' | 'event_active' | 'finished';
  settings: OcaSettings;
  boardSize: number;
  tiles: TileInfo[];
  players: OcaPlayer[];
  turnIndex: number;
  turnPlayerId: PlayerId | null;
  lastDiceRoll: number | null;
  currentEvent: OcaCard | null;
  activeCurses: OcaCurse[];
  winnerId: PlayerId | null;
  round: number;
}

export interface OcaPrivateState {
  // En este juego la información de mano es vacía, el estado es público y grupal
}

export interface OcaSecretState {
  deck: OcaCard[];
  usedCardIds: string[];
}

export type OcaAction =
  | { type: 'START_GAME' }
  | { type: 'ROLL_DICE' }
  | { type: 'RESOLVE_EVENT'; success: boolean; targetPlayerIds?: string[] }
  | { type: 'RESTART_GAME' }
  | { type: 'RETURN_TO_LOBBY' };
