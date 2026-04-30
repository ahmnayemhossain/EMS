import type { Employee } from "@/core/types/admin";

const EMPLOYEES_API = "/api/system/employees";

export type EmployeeLookupOption = {
  id: string;
  name: string;
};

export type EmployeeLookups = {
  facilities: EmployeeLookupOption[];
  departments: EmployeeLookupOption[];
  designations: EmployeeLookupOption[];
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
        : "Employee request failed.";
    throw new Error(message);
  }

  return data as T;
}

export async function listEmployees(userId: string) {
  const response = await fetch(EMPLOYEES_API, { cache: "no-store", headers: headers(userId) });
  return parseJsonResponse<Employee[]>(response);
}

export async function listEmployeeLookups() {
  const response = await fetch(`${EMPLOYEES_API}/lookups/options`, { cache: "no-store" });
  return parseJsonResponse<EmployeeLookups>(response);
}

export async function createEmployee(employee: Employee, userId: string) {
  const response = await fetch(EMPLOYEES_API, {
    method: "POST",
    headers: headers(userId),
    body: JSON.stringify(employee),
  });

  return parseJsonResponse<Employee>(response);
}

export async function updateEmployee(employee: Employee, userId: string) {
  const response = await fetch(`${EMPLOYEES_API}/${employee.id}`, {
    method: "PUT",
    headers: headers(userId),
    body: JSON.stringify(employee),
  });

  return parseJsonResponse<Employee>(response);
}

export async function deleteEmployee(id: string, userId: string) {
  const response = await fetch(`${EMPLOYEES_API}/${id}`, {
    method: "DELETE",
    headers: headers(userId),
  });

  return parseJsonResponse<{ ok: true }>(response);
}
