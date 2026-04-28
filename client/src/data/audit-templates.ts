export type AuditTemplateItem = {
  id: string; // unique across templates
  label: string;
  hint?: string;
};

export type AuditTemplateSection = {
  id: string;
  title: string;
  items: AuditTemplateItem[];
};

export type AuditTemplate = {
  id: string;
  name: string;
  description: string;
  sections: AuditTemplateSection[];
};

export const auditTemplates: AuditTemplate[] = [
  {
    id: "tmpl_garments_env_compliance",
    name: "Garments - Environmental Compliance (Full)",
    description:
      "End-to-end environmental compliance for garments companies: legal permits, ETP, chemicals/SDS, waste, utilities, monitoring, training and evidence.",
    sections: [
      {
        id: "legal",
        title: "Legal & Permits",
        items: [
          { id: "garments.legal.permits_valid", label: "All environmental permits are valid (renewal tracker updated)" },
          { id: "garments.legal.conditions", label: "Permit conditions mapped to monitoring plan and followed" },
          { id: "garments.legal.license_files", label: "Permit files uploaded and version-controlled in Documents" },
          { id: "garments.legal.legal_register", label: "Legal register maintained and reviewed (latest review signed)" },
          { id: "garments.legal.contractors", label: "Contractor/vendor approvals and licenses verified (waste/ETP/labs)" },
        ],
      },
      {
        id: "utilities",
        title: "Utilities & Resource Efficiency",
        items: [
          { id: "garments.util.meters", label: "Meters list maintained (electricity/water/fuel/steam) with owners" },
          { id: "garments.util.bills", label: "Bills uploaded and reconciled; variance flags reviewed" },
          { id: "garments.util.baseline", label: "Baseline + targets defined; monthly trend review documented" },
          { id: "garments.util.actions", label: "Improvement actions tracked (LED/HVAC/boiler/leak repairs)" },
          { id: "garments.util.calibration", label: "Critical meter calibration/verification records available" },
        ],
      },
      {
        id: "wastewater",
        title: "Wastewater / ETP",
        items: [
          { id: "garments.etp.daily_log", label: "ETP daily log complete (flow, pH, dosing, sludge)" },
          { id: "garments.etp.lab_reports", label: "Lab reports archived; sampling chain-of-custody maintained" },
          { id: "garments.etp.thresholds", label: "Thresholds configured; exceedance alerts + CAPA workflow in place" },
          { id: "garments.etp.sludge", label: "Sludge storage/dewatering/disposal evidence (manifests, certificates)" },
          { id: "garments.etp.maintenance", label: "ETP preventive maintenance plan + records (blower/pumps/RO/filters)" },
        ],
      },
      {
        id: "chemicals",
        title: "Chemicals, SDS & Storage",
        items: [
          { id: "garments.chem.inventory", label: "Chemical inventory complete with approvals, expiry, min stock" },
          { id: "garments.chem.sds", label: "SDS available for all active chemicals (16 sections) and linked" },
          { id: "garments.chem.storage", label: "Storage labels, bunding, segregation and compatibility controls" },
          { id: "garments.chem.ppe", label: "PPE signage, eyewash/shower checks, handler training documented" },
          { id: "garments.chem.restricted", label: "Restricted chemicals controls (approval evidence + substitution plan)" },
        ],
      },
      {
        id: "waste",
        title: "Waste Management",
        items: [
          { id: "garments.waste.segregation", label: "Segregation system with labeled bins + training" },
          { id: "garments.waste.storage", label: "Hazardous storage compliance (bunding, labels, access, spill kit)" },
          { id: "garments.waste.manifests", label: "Manifests and disposal certificates uploaded (traceable per stream)" },
          { id: "garments.waste.vendors", label: "Approved vendors list maintained with licenses" },
          { id: "garments.waste.backlog", label: "No overdue disposal backlog or CAPA exists for backlog" },
        ],
      },
      {
        id: "monitoring",
        title: "Monitoring, Testing & Reporting",
        items: [
          { id: "garments.mon.plan", label: "Monitoring plan covers wastewater, emissions, noise (where applicable)" },
          { id: "garments.mon.schedule", label: "Tests are on schedule; due-soon alerts configured" },
          { id: "garments.mon.records", label: "All monitoring records are uploaded and audit-ready" },
          { id: "garments.mon.report", label: "Monthly compliance report generated and reviewed" },
          { id: "garments.mon.incidents", label: "Incident log maintained; root cause + actions documented" },
        ],
      },
      {
        id: "management",
        title: "Management System & Readiness",
        items: [
          { id: "garments.mgmt.policy", label: "Environmental policy and objectives communicated to teams" },
          { id: "garments.mgmt.training", label: "Training matrix + attendance; critical roles assessed" },
          { id: "garments.mgmt.audits", label: "Internal audits performed; follow-up actions closed" },
          { id: "garments.mgmt.capa", label: "CAPA workflow used with evidence attachments and verification" },
          { id: "garments.mgmt.mr", label: "Management review held; minutes and actions recorded" },
        ],
      },
    ],
  },
  {
    id: "tmpl_iso14001_ems",
    name: "ISO 14001 (EMS) - Internal",
    description:
      "ISO 14001 readiness: context, leadership, planning, operations, performance evaluation and improvement.",
    sections: [
      {
        id: "leadership",
        title: "Leadership",
        items: [
          { id: "iso14001.policy", label: "Environmental policy approved and communicated" },
          { id: "iso14001.roles", label: "EMS roles/responsibilities assigned (RACI)" },
          { id: "iso14001.objectives", label: "Objectives & targets defined with plans" },
          { id: "iso14001.resources", label: "Resources allocated for EMS implementation" },
        ],
      },
      {
        id: "planning",
        title: "Planning",
        items: [
          { id: "iso14001.aspects", label: "Aspect/impact register updated (significance method)" },
          { id: "iso14001.legal_register", label: "Legal register maintained and reviewed" },
          { id: "iso14001.risks", label: "Risks/opportunities assessed and tracked" },
          { id: "iso14001.change_mgmt", label: "Change management for new lines/chemicals/process" },
        ],
      },
      {
        id: "operation",
        title: "Operations",
        items: [
          { id: "iso14001.controls", label: "Operational controls implemented and recorded" },
          { id: "iso14001.emergency", label: "Emergency preparedness drills and records" },
          { id: "iso14001.supplier", label: "Contractor/supplier controls for environmental risks" },
          { id: "iso14001.comms", label: "Internal/external communications process implemented" },
        ],
      },
      {
        id: "evaluation",
        title: "Evaluation & Improvement",
        items: [
          { id: "iso14001.monitoring", label: "Monitoring plan executed (water/energy/emissions)" },
          { id: "iso14001.calibration", label: "Calibration/verification records for key instruments" },
          { id: "iso14001.internal_audit", label: "Internal audit program executed with evidence" },
          { id: "iso14001.mgmt_review", label: "Management review minutes with actions" },
        ],
      },
    ],
  },
  {
    id: "tmpl_zdhc_env",
    name: "ZDHC - Chemicals & Wastewater",
    description:
      "Chemical governance, MRSL controls, wastewater monitoring, and evidence readiness for ZDHC-style programs.",
    sections: [
      {
        id: "chem_governance",
        title: "Chemical Governance",
        items: [
          { id: "zdhc.mrsl", label: "MRSL conformance process documented (purchase approval)" },
          { id: "zdhc.inventory", label: "Chemical inventory current with approvals and expiry" },
          { id: "zdhc.sds", label: "SDS repository complete and accessible (linked to inventory)" },
          { id: "zdhc.storage", label: "Storage labels, bunding, incompatibility controls" },
          { id: "zdhc.training", label: "Training and PPE checks for chemical handlers" },
        ],
      },
      {
        id: "wastewater",
        title: "Wastewater / ETP",
        items: [
          { id: "zdhc.sampling", label: "Sampling plan and chain-of-custody records" },
          { id: "zdhc.parameters", label: "Key parameters tracked (pH, COD, BOD, TSS) with trends" },
          { id: "zdhc.exceedance", label: "Exceedance workflow defined (notify, CAPA, verify)" },
          { id: "zdhc.sludge", label: "Sludge management evidence (storage, dewatering, disposal)" },
        ],
      },
      {
        id: "data",
        title: "Data & Evidence",
        items: [
          { id: "zdhc.uploads", label: "Supporting uploads ready (reports, manifests, photos)" },
          { id: "zdhc.capa", label: "CAPA linked to failures with evidence" },
          { id: "zdhc.traceability", label: "Chemical usage traceability where applicable" },
        ],
      },
    ],
  },
  {
    id: "tmpl_green_company",
    name: "Green Company (Readiness)",
    description:
      "Green readiness across utilities, ETP, waste, monitoring and documentation (template to adapt per authority/standard).",
    sections: [
      {
        id: "resource",
        title: "Resource Efficiency",
        items: [
          { id: "green.baseline", label: "Energy/water baseline and reduction initiatives tracked" },
          { id: "green.boiler", label: "Boiler/steam efficiency checks and maintenance records" },
          { id: "green.hvac", label: "HVAC and ventilation checks; maintenance logs" },
          { id: "green.lighting", label: "Lighting optimization evidence (retrofits/controls)" },
        ],
      },
      {
        id: "etp",
        title: "ETP & Compliance",
        items: [
          { id: "green.etp.logs", label: "ETP daily logs: dosing, flow, pH, sludge" },
          { id: "green.etp.limits", label: "Discharge limits met; corrective actions for deviations" },
          { id: "green.permits", label: "Permits & renewals tracked; compliance evidence available" },
        ],
      },
      {
        id: "waste",
        title: "Waste & Circularity",
        items: [
          { id: "green.segregation", label: "Segregation system with signage and training" },
          { id: "green.vendors", label: "Approved vendors, manifests, and disposal certificates" },
          { id: "green.haz_storage", label: "Hazardous waste storage compliance (bunding, labels)" },
        ],
      },
      {
        id: "mgmt",
        title: "Management & Evidence",
        items: [
          { id: "green.docs", label: "Procedures and evidence pack prepared (audit-ready)" },
          { id: "green.training", label: "Training records and competency checks" },
          { id: "green.internal_audit", label: "Internal audits and follow-ups documented" },
        ],
      },
    ],
  },
  {
    id: "tmpl_oekotex_step",
    name: "OEKO-TEX STeP (Readiness)",
    description:
      "STeP-style readiness: management, chemicals, environment, and workplace (starter template).",
    sections: [
      {
        id: "mgmt",
        title: "Management",
        items: [
          { id: "step.policy", label: "Sustainability policy and responsibilities assigned" },
          { id: "step.doc_control", label: "Document control and records retention implemented" },
          { id: "step.supplier_eval", label: "Supplier evaluation and approved list for chemicals" },
        ],
      },
      {
        id: "chem",
        title: "Chemicals",
        items: [
          { id: "step.inventory", label: "Chemical inventory complete with approvals/expiry" },
          { id: "step.sds", label: "SDS available for all active chemicals" },
          { id: "step.storage", label: "Storage safety and compatibility checks passed" },
        ],
      },
      {
        id: "environment",
        title: "Environment",
        items: [
          { id: "step.energy", label: "Energy monitoring and improvement plan" },
          { id: "step.water", label: "Water monitoring and reduction plan" },
          { id: "step.wastewater", label: "Wastewater compliance and monitoring evidence" },
        ],
      },
      {
        id: "workplace",
        title: "Workplace & Safety",
        items: [
          { id: "step.training", label: "Training, PPE and emergency readiness documented" },
          { id: "step.incidents", label: "Incident logs and corrective actions maintained" },
        ],
      },
    ],
  },
];

export function getTemplateById(id: string) {
  return auditTemplates.find((t) => t.id === id);
}

