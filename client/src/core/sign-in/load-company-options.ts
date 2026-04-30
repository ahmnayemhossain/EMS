import type { CompanyOption } from "./types";

export async function loadCompanyOptions() {
  const response = await fetch("/api/system/companies/options", { cache: "no-store" });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Could not load companies.");
  return Array.isArray(data)
    ? data.map((company) => ({ id: String(company.id), name: String(company.name || "Company") }))
    : ([] as CompanyOption[]);
}
