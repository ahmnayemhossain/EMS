import { ensureCoreSchema, getCompanyIdByValue } from "../../shared/schema.js";

let readyPromise;

export function ensureReady() {
  if (!readyPromise) readyPromise = ensureCoreSchema();
  return readyPromise;
}

export function toDateString(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

export function toEmployee(row) {
  return {
    id: String(row.id), dbId: Number(row.id), name: row.name,
    employeeId: Number(row.employee_id), companyId: row.company_id ? String(row.company_id) : "",
    departmentId: row.department_id ? String(row.department_id) : "",
    designationId: row.designation_id ? String(row.designation_id) : "",
    status: Number(row.is_active), email: row.email, phone: row.phone || undefined,
    department: row.department_name || undefined, designation: row.designation_name || undefined,
    joinedOn: toDateString(row.joined_on),
    createdByUserId: row.created_by_user_id ? String(row.created_by_user_id) : undefined,
    createdByUserName: row.created_by_user_name || undefined,
    updatedByUserId: row.updated_by_user_id ? String(row.updated_by_user_id) : undefined,
    updatedByUserName: row.updated_by_user_name || undefined,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at,
  };
}

function requiredString(input, key, label) {
  const value = String(input[key] || "").trim();
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

function optionalDate(input, key) {
  const value = String(input[key] || "").trim();
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${key} must be YYYY-MM-DD.`);
  return value;
}

export function normalizeEmployeeInput(input) {
  const employeeId = Number(input.employeeId ?? input.employee_id);
  if (!Number.isFinite(employeeId) || employeeId <= 0) throw new Error("Employee ID must be a positive number.");
  const status = Number(input.status ?? input.isActive ?? input.is_active ?? 1);
  if (![0, 1].includes(status)) throw new Error("Status must be 0 or 1.");
  return {
    employeeId,
    name: requiredString(input, "name", "Name"),
    companyId: requiredString(input, "companyId", "Company"),
    departmentId: requiredString(input, "departmentId", "Department"),
    designationId: requiredString(input, "designationId", "Designation"),
    status,
    email: requiredString(input, "email", "Email").toLowerCase(),
    phone: input.phone ? String(input.phone).trim() : null,
    joinedOn: optionalDate(input, "joinedOn"),
  };
}

export async function getCompanyIdOrThrow(value) {
  const id = await getCompanyIdByValue(value);
  if (!id) throw new Error("Invalid company.");
  return id;
}
