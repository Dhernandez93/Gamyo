type PlayerId = string;

export interface CrSettings {
  // Custom rules mappings? For now we just use the standard
}

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface PlayingCard {
  suit: Suit;
  rank: Rank;
}

export interface CustomRule {
  authorId: PlayerId;
  text: string;
}

export interface CrPublicState {
  phase: 'lobby' | 'playing' | 'finished';
  turnId: PlayerId | null;
  direction: 1 | -1; // 1 for clockwise, -1 for counter-clockwise
  lastDrawnCard: PlayingCard | null;
  lastDrawnPlayerId: PlayerId | null;
  kingsDrawn: number;
  questionMaster: PlayerId | null;
  thumbMaster: PlayerId | null;
  rules: CustomRule[];
  cardsLeft: number;
  players?: any[];
}

export interface CrPrivateState {
  // No private hand in Cuarto Rey, everyone draws from the middle
}

export interface CrSecretState {
  deck: PlayingCard[];
  rngSeed: string;
}

export type CrAction = 
  | { type: 'START_GAME' }
  | { type: 'DRAW_CARD' }
  | { type: 'ADD_RULE'; ruleText: string }
  | { type: 'RESTART_GAME' };
