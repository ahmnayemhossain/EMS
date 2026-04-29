import type { SettingsEntity } from "./settingsEntityApi";

const SYSTEM_API = "/api/system";

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

async function parseJsonResponse<T>(response: Response, fallback: string): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : fallback;
    throw new Error(message);
  }

  return data as T;
}

export type UtilityTypeOption = {
  id: string;
  key: string;
  name: string;
};

export type UomWiringEntity = {
  id: string;
  uomId: string;
  uomName: string;
  utilityTypeId: string;
  utilityTypeKey: string;
  utilityTypeName: string;
  status: 0 | 1;
  createdByUserId?: string;
  createdByUserName?: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SourceWiringEntity = {
  id: string;
  sourceId: string;
  sourceName: string;
  utilityTypeId: string;
  utilityTypeKey: string;
  utilityTypeName: string;
  status: 0 | 1;
  createdByUserId?: string;
  createdByUserName?: string;
  updatedByUserId?: string;
  updatedByUserName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function listUomWiring(userId: string) {
  const response = await fetch(`${SYSTEM_API}/uom-wiring`, {
    cache: "no-store",
    headers: headers(userId),
  });
  return parseJsonResponse<UomWiringEntity[]>(response, "Could not load UOM wiring.");
}

export async function listUomWiringLookups(userId: string) {
  const response = await fetch(`${SYSTEM_API}/uom-wiring/lookups/options`, {
    cache: "no-store",
    headers: headers(userId),
  });
  return parseJsonResponse<{ uomOptions: SettingsEntity[]; utilityTypeOptions: UtilityTypeOption[] }>(
    response,
    "Could not load UOM wiring options.",
  );
}

export async function createUomWiring(
  item: Pick<UomWiringEntity, "uomId" | "utilityTypeId" | "status">,
  userId: string,
) {
  const response = await fetch(`${SYSTEM_API}/uom-wiring`, {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(item),
  });
  return parseJsonResponse<UomWiringEntity>(response, "Could not create UOM wiring.");
}

export async function updateUomWiring(
  item: Pick<UomWiringEntity, "id" | "uomId" | "utilityTypeId" | "status">,
  userId: string,
) {
  const response = await fetch(`${SYSTEM_API}/uom-wiring/${item.id}`, {
    method: "PUT",
    headers: headers(userId),
    body: JSON.stringify(item),
  });
  return parseJsonResponse<UomWiringEntity>(response, "Could not update UOM wiring.");
}

export async function deleteUomWiring(id: string, userId: string) {
  const response = await fetch(`${SYSTEM_API}/uom-wiring/${id}`, {
    method: "DELETE",
    headers: headers(userId),
  });
  return parseJsonResponse<{ ok: true }>(response, "Could not delete UOM wiring.");
}

export async function listSourceWiring(userId: string) {
  const response = await fetch(`${SYSTEM_API}/source-wiring`, {
    cache: "no-store",
    headers: headers(userId),
  });
  return parseJsonResponse<SourceWiringEntity[]>(response, "Could not load source wiring.");
}

export async function listSourceWiringLookups(userId: string) {
  const response = await fetch(`${SYSTEM_API}/source-wiring/lookups/options`, {
    cache: "no-store",
    headers: headers(userId),
  });
  return parseJsonResponse<{ sourceOptions: SettingsEntity[]; utilityTypeOptions: UtilityTypeOption[] }>(
    response,
    "Could not load source wiring options.",
  );
}

export async function createSourceWiring(
  item: Pick<SourceWiringEntity, "sourceId" | "utilityTypeId" | "status">,
  userId: string,
) {
  const response = await fetch(`${SYSTEM_API}/source-wiring`, {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(item),
  });
  return parseJsonResponse<SourceWiringEntity>(response, "Could not create source wiring.");
}

export async function updateSourceWiring(
  item: Pick<SourceWiringEntity, "id" | "sourceId" | "utilityTypeId" | "status">,
  userId: string,
) {
  const response = await fetch(`${SYSTEM_API}/source-wiring/${item.id}`, {
    method: "PUT",
    headers: headers(userId),
    body: JSON.stringify(item),
  });
  return parseJsonResponse<SourceWiringEntity>(response, "Could not update source wiring.");
}

export async function deleteSourceWiring(id: string, userId: string) {
  const response = await fetch(`${SYSTEM_API}/source-wiring/${id}`, {
    method: "DELETE",
    headers: headers(userId),
  });
  return parseJsonResponse<{ ok: true }>(response, "Could not delete source wiring.");
}
