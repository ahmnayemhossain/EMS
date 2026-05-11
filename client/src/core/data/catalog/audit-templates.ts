import { garmentsTemplate } from "../audit-templates/garments";
import { greenTemplate, isoTemplate, stepTemplate, zdhcTemplate } from "../audit-templates/others";

export type {
  AuditTemplate, AuditTemplateItem, AuditTemplateSection,
} from "../audit-templates/types";

export const auditTemplates = [
  garmentsTemplate, isoTemplate, zdhcTemplate, greenTemplate, stepTemplate,
];

export function getTemplateById(id: string) {
  return auditTemplates.find((template) => template.id === id);
}
