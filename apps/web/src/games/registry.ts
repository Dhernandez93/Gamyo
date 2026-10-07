import { GameScreen } from '../app/routes/GameScreen';
import { HDN_GAME_ID } from '../../../../supabase/functions/_shared/games/hora-del-nache/reducer'; // Import from backend types to share ID

export interface GameUIProps {
  room: any;
  hand: any;
  user?: any;
  playersInfo: any[];
}

export const gameUIRegistry: Record<string, React.FC<GameUIProps>> = {
  [HDN_GAME_ID]: GameScreen,
};
