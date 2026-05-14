import type {
  Audit,
  CAPA,
  Chemical,
  Document,
  Incident,
  Notification,
  SDSRecord,
  TrainingRecord,
  UtilityRecord,
  WasteRecord,
  WastewaterRecord,
} from "@/core/types/models/ems";

export const audits: Audit[] = [];
export const capas: CAPA[] = [];
export const chemicals: Chemical[] = [];
export const documents: Document[] = [];
export const incidents: Incident[] = [];
export const notifications: Notification[] = [];
export const sdsRecords: SDSRecord[] = [];
export const trainingRecords: TrainingRecord[] = [];
export const utilityRecords: UtilityRecord[] = [];
export const wasteRecords: WasteRecord[] = [];
export const wastewaterRecords: WastewaterRecord[] = [];

export { facilities, getFacilityById, getFacilityName, group } from "../mock/core";
