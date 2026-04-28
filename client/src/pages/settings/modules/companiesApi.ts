const FACTORIES_API = "/api/system/companies";

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

function toServerUserId(userId: string) {
  const match = /^u_([^_]+)_/.exec(userId);
  return match ? match[1] : userId;
}

function headers(userId: string) {
  return {
    "Content-Type": "application/json",
    "x-user-id": toServerUserId(userId),
  };
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : "Company request failed.";
    throw new Error(message);
  }
  return data as T;
}

export async function listCompanies(userId: string) {
  const response = await fetch(FACTORIES_API, { cache: "no-store", headers: headers(userId) });
  return parseJsonResponse<CompanyEntity[]>(response);
}

export async function createCompany(company: CompanyEntity, userId: string) {
  const response = await fetch(FACTORIES_API, {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(company),
  });
  return parseJsonResponse<CompanyEntity>(response);
}

export async function updateCompany(company: CompanyEntity, userId: string) {
  const response = await fetch(`${FACTORIES_API}/${company.id}`, {
    method: "PUT",
    headers: headers(userId),
    body: JSON.stringify(company),
  });
  return parseJsonResponse<CompanyEntity>(response);
}

export async function deleteCompany(id: string, userId: string) {
  const response = await fetch(`${FACTORIES_API}/${id}`, {
    method: "DELETE",
    headers: headers(userId),
  });
  return parseJsonResponse<{ ok: true }>(response);
}
