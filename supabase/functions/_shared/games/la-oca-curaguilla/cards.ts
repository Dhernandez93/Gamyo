import type { OcaCard } from "./types.ts";
import { OCA_CARDS_LVL_1 } from "./cards-level-1.ts";
import { OCA_CARDS_LVL_2 } from "./cards-level-2.ts";
import { OCA_CARDS_LVL_3 } from "./cards-level-3.ts";
import { OCA_CARDS_LVL_4 } from "./cards-level-4.ts";

export { OCA_CARDS_LVL_1 } from "./cards-level-1.ts";
export { OCA_CARDS_LVL_2 } from "./cards-level-2.ts";
export { OCA_CARDS_LVL_3 } from "./cards-level-3.ts";
export { OCA_CARDS_LVL_4 } from "./cards-level-4.ts";

export const OCA_CARDS: OcaCard[] = [
  ...OCA_CARDS_LVL_1,
  ...OCA_CARDS_LVL_2,
  ...OCA_CARDS_LVL_3,
  ...OCA_CARDS_LVL_4
];
