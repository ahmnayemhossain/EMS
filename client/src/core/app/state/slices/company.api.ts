import type { CompanyOption } from "@/core/app/state/slices/company";

export function authHeaders(token?: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function mapCompanies(data: unknown): CompanyOption[] {
  if (!Array.isArray(data)) return [];
  return data.map((company) => ({
    id: String(company.id),
    name: String(company.name || "Company"),
    shortName: company.shortName ? String(company.shortName) : undefined,
    localName: company.localName ? String(company.localName) : undefined,
    address: company.address ? String(company.address) : undefined,
  }));
}

export async function fetchCompanies(token?: string | null) {
  const response = await fetch("/api/system/companies/options", {
    cache: "no-store",
    headers: authHeaders(token),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not load companies.");
  return mapCompanies(data);
}
