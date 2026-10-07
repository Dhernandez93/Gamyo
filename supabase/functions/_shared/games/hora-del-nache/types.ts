import type { PlayerId } from "../../engine/types.ts";

export interface HdnSettings {
  scoreToWin: number;
  handSize: number;
  judgingTime: number; // seconds
  playingTime: number; // seconds
  blanksPerPlayer: number;
}

export interface BlackCard {
  id: string;
  text: string;
  pick: 1 | 2 | 3;
}

export interface WhiteCard {
  id: string;
  text: string;
  isBlank?: boolean;
}

export interface HdnPublicState {
  phase: 'lobby' | 'dealing' | 'playing' | 'judging' | 'reveal' | 'finished';
  round: number;
  players?: any[];
  czarId: PlayerId | null;
  blackCard: BlackCard | null;
  submittedBy: PlayerId[];                                        
  submissions: { anonId: string; cards: WhiteCard[] }[] | null;   
  lastWinner?: { playerId: PlayerId; cards: WhiteCard[]; blackCard: BlackCard };
  standby?: PlayerId[];
  scores: Record<PlayerId, number>;
  pileCount: { black: number; white: number };
}

export interface HdnPrivateState { 
  hand: WhiteCard[]; 
  submitted?: WhiteCard[]; 
  blanksLeft: number;
}

export interface HdnSecretState { 
  whiteDeck: WhiteCard[]; 
  blackDeck: BlackCard[]; 
  discardWhite: WhiteCard[]; 
  discardBlack: BlackCard[];
  anonMap: Record<string, PlayerId>; 
  rngSeed: string; 
}

export type HdnAction =
  | { type: 'START_GAME' }
  | { type: 'PLAY_CARDS'; cards: WhiteCard[] }
  | { type: 'PICK_WINNER'; anonId: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'LEAVE_GAME' }
  | { type: 'RETURN_TO_LOBBY' }
  | { type: 'PASS_BLACK_CARD' }
