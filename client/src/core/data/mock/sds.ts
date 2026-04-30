import type { SDSRecord } from "@/core/types/ems";

import { baseSdsRecords } from "./sds-base";
import { generatedSdsRecords } from "./sds-generated";

export const sdsRecords: SDSRecord[] = [...baseSdsRecords, ...generatedSdsRecords];
