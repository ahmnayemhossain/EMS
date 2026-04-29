import type { CompanyEntity } from "@/pages/settings/modules/companiesApi";
import type { CompanyValidationErrors } from "@/pages/settings/modules/companies/companies.types";

export function blankCompany(): CompanyEntity {
  return { id: "", name: "", shortName: "", localName: "", address: "", status: 1 };
}

export function validateCompany(company: CompanyEntity, rows: CompanyEntity[], currentId?: string) {
  const errors: CompanyValidationErrors = {};
  if (!company.name.trim()) errors.name = "Company name is required";
  else if (rows.some((row) => row.id !== currentId && row.name.toLowerCase() === company.name.toLowerCase())) errors.name = "Company name already exists";
  if (!company.shortName.trim()) errors.shortName = "Short name is required";
  else if (rows.some((row) => row.id !== currentId && row.shortName.toLowerCase() === company.shortName.toLowerCase())) errors.shortName = "Short name already exists";
  if (![0, 1].includes(Number(company.status))) errors.status = "Status is required";
  return errors;
}

export function firstCompanyError(errors: CompanyValidationErrors) {
  return Object.values(errors)[0] ?? null;
}
