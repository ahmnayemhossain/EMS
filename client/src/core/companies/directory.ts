import type { CompanyOption } from "@/core/app/state/slices/company";
import { useCompanyStore } from "@/core/app/state/slices/company.store";

function normalize(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

function getDirectory(companies?: CompanyOption[]) {
  return companies?.length ? companies : useCompanyStore.getState().companies;
}

export function findCompanyById(companyId?: string | null, companies?: CompanyOption[]) {
  if (!companyId) return undefined;
  return getDirectory(companies).find((company) => String(company.id) === String(companyId));
}

export function findCompanyByCode(code?: string | null, companies?: CompanyOption[]) {
  const normalizedCode = normalize(code);
  if (!normalizedCode) return undefined;
  return getDirectory(companies).find((company) => {
    const shortName = normalize(company.shortName);
    const name = normalize(company.name);
    return shortName === normalizedCode || name === normalizedCode;
  });
}

export function getCompanyName(companyId?: string | null, companies?: CompanyOption[], fallback = "Unknown company") {
  return findCompanyById(companyId, companies)?.name || fallback;
}

export function getCompanyCode(companyId?: string | null, companies?: CompanyOption[]) {
  return findCompanyById(companyId, companies)?.shortName?.trim() || "";
}

export function getCompanyPublicLabel(companyId?: string | null, companies?: CompanyOption[], fallback = "অজানা প্রতিষ্ঠান") {
  const company = findCompanyById(companyId, companies);
  return company?.localName?.trim() || company?.shortName?.trim() || company?.name?.trim() || fallback;
}
