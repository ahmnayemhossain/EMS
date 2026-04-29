import type { Audit, CAPA, Document, Incident, Notification, TrainingRecord } from "@/types/ems";

export const audits: Audit[] = [
  { id: "aud_001", facilityId: "fac_garments_a", name: "ISO 14001 Internal Audit", customerName: "Internal", date: "2026-04-22", nextAuditDate: "2026-07-22", auditor: "User Two (EMP-0002)", progress: 55, overallScore: 84, findingsCount: { minor: 6, major: 1, critical: 0 } },
  { id: "aud_002", facilityId: "fac_dyeing_d", name: "Buyer Environmental Audit (Pre-check)", customerName: "Buyer", date: "2026-04-16", nextAuditDate: "2026-06-16", auditor: "User Three (EMP-0003)", progress: 40, overallScore: 72, findingsCount: { minor: 9, major: 3, critical: 1 } },
];

export const capas: CAPA[] = [
  { id: "capa_001", facilityId: "fac_dyeing_d", title: "ETP outlet pH exceedance — dosing control tuning", owner: "User Four (EMP-0004)", severity: "major", status: "overdue", dueDate: "2026-04-08", evidenceCount: 2 },
  { id: "capa_002", facilityId: "fac_garments_a", title: "Update waste segregation signage in loading bay", owner: "User Five (EMP-0005)", severity: "minor", status: "in_progress", dueDate: "2026-04-18", evidenceCount: 1 },
  { id: "capa_003", facilityId: "fac_shoe_s", title: "Restricted adhesive approval — substitute review", owner: "User Six (EMP-0006)", severity: "major", status: "open", dueDate: "2026-04-25", evidenceCount: 0 },
];

export const documents: Document[] = [
  { id: "doc_001", facilityId: "fac_dyeing_d", title: "Regulator Discharge Permit", category: "permit", ownerDepartment: "EHS (User Seven EMP-0007)", expiresOn: "2026-04-30", status: "expiring", fileName: "Regulator_Discharge_Permit_Company C_2025-2026.pdf" },
  { id: "doc_002", facilityId: "fac_garments_a", title: "Hazardous Waste Vendor Contract", category: "contract", ownerDepartment: "Admin (User Five EMP-0005)", expiresOn: "2026-03-31", status: "expired", fileName: "HazWaste_Contract_Company A_2025.pdf" },
  { id: "doc_003", facilityId: "fac_resort_r", title: "Water Quality Test Report (Quarterly)", category: "report", ownerDepartment: "Operations (User One EMP-0001)", status: "valid", fileName: "Water_Test_Q1_2026_SiteE.pdf" },
];

export const incidents: Incident[] = [
  { id: "inc_001", facilityId: "fac_dyeing_d", date: "2026-04-03", title: "ETP outlet pH high (lab confirm)", type: "wastewater_exceedance", severity: "high", status: "investigating" },
  { id: "inc_002", facilityId: "fac_shoe_s", date: "2026-03-26", title: "Minor solvent spill near bonding line", type: "spill", severity: "medium", status: "closed" },
  { id: "inc_003", facilityId: "fac_garments_a", date: "2026-04-05", title: "Near-miss: waste trolley blocking emergency exit (cleared)", type: "near_miss", severity: "low", status: "open" },
];

export const trainingRecords: TrainingRecord[] = [
  { id: "tr_001", facilityId: "fac_garments_a", title: "Waste segregation & labeling", audience: "Production supervisors", completedOn: "2026-02-18", nextDueOn: "2027-02-18", status: "complete" },
  { id: "tr_002", facilityId: "fac_dyeing_d", title: "Chemical handling & PPE (wet processing)", audience: "Dyeing floor operators", completedOn: "2025-04-10", nextDueOn: "2026-04-10", status: "due_soon" },
];

export const notifications: Notification[] = [
  { id: "not_001", createdAt: "2026-04-08T09:20:00+06:00", facilityId: "fac_dyeing_d", tone: "critical", title: "Wastewater exceedance requires CAPA", description: "Outlet pH exceeded threshold in latest lab report. Create corrective action and attach evidence.", read: false, actionTo: "/wastewater", actionLabel: "Open wastewater" },
  { id: "not_002", createdAt: "2026-04-07T15:10:00+06:00", facilityId: "fac_garments_a", tone: "warning", title: "Permit expiring soon", description: "Regulator Discharge Permit for Company C expires on 2026-04-30. Start renewal workflow.", read: true, actionTo: "/documents", actionLabel: "Open documents" },
  { id: "not_003", createdAt: "2026-04-06T10:05:00+06:00", tone: "info", title: "Monthly utilities review ready", description: "March utilities records imported. Review variance flags and attach missing bills.", read: true, actionTo: "/utilities", actionLabel: "Open utilities" },
];
