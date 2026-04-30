export type AuditTemplateItem = {
  id: string;
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
