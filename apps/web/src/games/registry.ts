import { GameScreen } from '../app/routes/GameScreen';
import { CuartoReyScreen } from '../app/routes/CuartoReyScreen';
import { LaOcaScreen } from '../app/routes/LaOcaScreen';

export const HDN_GAME_ID = 'hora-del-nache';
export const CUARTO_REY_ID = 'cuarto-rey';
export const OCA_GAME_ID = 'la-oca-curaguilla';

export interface GameUIProps {
  room: any;
  hand: any;
  user?: any;
  playersInfo: any[];
}

export const gameUIRegistry: Record<string, React.FC<GameUIProps>> = {
  [HDN_GAME_ID]: GameScreen,
  [CUARTO_REY_ID]: CuartoReyScreen,
  [OCA_GAME_ID]: LaOcaScreen,
};
