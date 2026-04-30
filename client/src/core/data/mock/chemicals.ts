import type { Chemical } from "@/core/types/ems";

import { baseChemicals } from "./chemicals-base";
import { generatedChemicals } from "./chemicals-generated";

export const chemicals: Chemical[] = [...baseChemicals, ...generatedChemicals];
