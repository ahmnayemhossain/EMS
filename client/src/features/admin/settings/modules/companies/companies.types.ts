import type { CompanyEntity } from "@/features/admin/settings/modules/companiesApi";

export type CompanyValidationErrors = Partial<Record<"name" | "shortName" | "status", string>>;
export type CompanyVm = {
  userId: string;
  companies: CompanyEntity[];
  loading: boolean;
  search: string;
  selected: CompanyEntity | null;
  editDraft: CompanyEntity | null;
  confirmDelete: boolean;
  createOpen: boolean;
  draft: CompanyEntity;
  createErrors: CompanyValidationErrors;
  editErrors: CompanyValidationErrors;
};
