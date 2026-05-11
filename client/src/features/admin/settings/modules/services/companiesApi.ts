import { createSystemHeaders, parseSystemResponse } from "@/features/admin/settings/modules/api/system-api";

const COMPANIES_API = "/api/system/companies";

export type CompanyEntity = {
  id: string;
  name: string;
  shortName: string;
  localName?: string;
  address?: string;
  status: 0 | 1;
  createdByUserId?: string;
  createdByUserName?: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function listCompanies(userId: string) {
  const response = await fetch(COMPANIES_API, { cache: "no-store", headers: createSystemHeaders(userId) });
  return parseSystemResponse<CompanyEntity[]>(response, "Company request failed.");
}

export async function createCompany(company: CompanyEntity, userId: string) {
  const response = await fetch(COMPANIES_API, {
    method: "POST",
    headers: createSystemHeaders(userId),
    body: JSON.stringify(company),
  });
  return parseSystemResponse<CompanyEntity>(response, "Company request failed.");
}

export async function updateCompany(company: CompanyEntity, userId: string) {
  const response = await fetch(`${COMPANIES_API}/${company.id}`, {
    method: "PUT",
    headers: createSystemHeaders(userId),
    body: JSON.stringify(company),
  });
  return parseSystemResponse<CompanyEntity>(response, "Company request failed.");
}

export async function deleteCompany(id: string, userId: string) {
  const response = await fetch(`${COMPANIES_API}/${id}`, {
    method: "DELETE",
    headers: createSystemHeaders(userId),
  });
  return parseSystemResponse<{ ok: true }>(response, "Company request failed.");
}
