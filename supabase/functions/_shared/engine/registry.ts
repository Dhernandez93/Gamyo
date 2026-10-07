import { HdnSettings } from '../games/hora-del-nache/types.ts';
import { horaDelNache, HDN_GAME_ID } from '../games/hora-del-nache/reducer.ts';

export interface GameEngine {
  id: string;
  reduce: (fullState: any, action: any, ctx: any) => { publicState: any, privateState: any, secretState: any };
}

export const gameRegistry: Record<string, GameEngine> = {
  [HDN_GAME_ID]: {
    id: HDN_GAME_ID,
    reduce: horaDelNache.reduce
  }
};
