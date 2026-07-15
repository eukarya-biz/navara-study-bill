import { abbasidCaliphate } from "./abbasidCaliphate";
import { britishEmpire } from "./britishEmpire";
import { mongolEmpire } from "./mongolEmpire";
import { qingDynasty } from "./qingDynasty";
import { romanEmpire } from "./romanEmpire";
import type { Empire } from "./types";

// Ordered chronologically by each empire's peak, for a coherent progression
// through the switcher: Rome -> the Abbasid Caliphate -> the Mongols -> Qing
// China -> the British Empire.
export const empires: Empire[] = [
  romanEmpire,
  abbasidCaliphate,
  mongolEmpire,
  qingDynasty,
  britishEmpire,
];

export type { Empire } from "./types";
