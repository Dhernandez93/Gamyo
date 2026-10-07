export interface Card {
  id: string;
  kind: 'white' | 'black';
  text: string;
  pick?: number;
}

export interface PlayerState {
  id: string;
  score: number;
  hasPlayed: boolean;
}

export interface GameSettings {
  scoreToWin: number;
  allowExpansions: boolean;
  decks: string[];
}

export interface PublicGameState {
  phase: 'lobby' | 'starting' | 'playing' | 'revealing' | 'finished';
  gameId: string;
  players: PlayerState[];
  settings: GameSettings;
  czarId: string | null;
  currentBlackCard: Card | null;
  playedCardsCount: number; // How many players have played their cards this round
  revealedCards: { playerId: string; cards: Card[] }[]; // Only populated during 'revealing' phase
  winnerId: string | null; // For round winner or game winner
}

export interface SecretGameState {
  drawPileWhite: Card[];
  drawPileBlack: Card[];
  playedCards: { playerId: string; cards: Card[] }[]; // Secret during 'playing' phase
}

export type GameAction = 
  | { type: 'START_GAME'; payload: { whiteCards: Card[], blackCards: Card[] } }
  | { type: 'PLAY_CARD'; payload: { playerId: string, cards: Card[] } }
  | { type: 'REVEAL_CARDS' }
  | { type: 'CHOOSE_WINNER'; payload: { playerId: string } }
  | { type: 'PASS_BLACK_CARD' }
  | { type: 'NEXT_ROUND' };
