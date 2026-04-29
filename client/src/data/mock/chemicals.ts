import type { Chemical } from "@/types/ems";

import { baseChemicals } from "./chemicals-base";
import { generatedChemicals } from "./chemicals-generated";

export const chemicals: Chemical[] = [...baseChemicals, ...generatedChemicals];
