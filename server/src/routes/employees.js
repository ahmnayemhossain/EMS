import { Router } from "express";

import { getRequestActor, writeAuditLog } from "../shared/audit-log.js";
import { requirePermission } from "../shared/permissions.js";
import { ensureCoreSchema, getCompanyIdByValue } from "../shared/schema.js";
import { pool, query } from "../shared/postgres.js";

export const employeesRouter = Router();

let readyPromise;

function ensureReady() {
  if (!readyPromise) readyPromise = ensureCoreSchema();
  return readyPromise;
}

function toDateString(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toEmployee(row) {
  return {
    id: String(row.id),
    dbId: Number(row.id),
    name: row.name,
    employeeId: Number(row.employee_id),
    companyId: row.company_id ? String(row.company_id) : "",
    departmentId: row.department_id ? String(row.department_id) : "",
    designationId: row.designation_id ? String(row.designation_id) : "",
    status: Number(row.is_active),
    email: row.email,
    phone: row.phone || undefined,
    department: row.department_name || undefined,
    designation: row.designation_name || undefined,
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

async function getIdByValueOrThrow(table, value, label) {
  const id = Number(value);
  if (!Number.isFinite(id) || id <= 0) throw new Error(`Invalid ${label}.`);
  const result = await query(`SELECT id FROM ${table} WHERE id = $1`, [id]);
  if (!result.rows[0]?.id) throw new Error(`Invalid ${label}.`);
  return result.rows[0].id;
}

async function getCompanyIdOrThrow(value) {
  const id = await getCompanyIdByValue(value);
  if (!id) throw new Error("Invalid company.");
  return id;
}

function normalizeEmployeeInput(input) {
  const employeeId = Number(input.employeeId ?? input.employee_id);
  if (!Number.isFinite(employeeId) || employeeId <= 0) {
    throw new Error("Employee ID must be a positive number.");
  }

  const status = Number(input.status ?? input.isActive ?? input.is_active ?? 1);
  if (![0, 1].includes(status)) throw new Error("Status must be 0 or 1.");

  const email = requiredString(input, "email", "Email").toLowerCase();

  return {
    employeeId,
    name: requiredString(input, "name", "Name"),
    companyId: requiredString(input, "companyId", "Company"),
    departmentId: requiredString(input, "departmentId", "Department"),
    designationId: requiredString(input, "designationId", "Designation"),
    status,
    email,
    phone: input.phone ? String(input.phone).trim() : null,
    joinedOn: optionalDate(input, "joinedOn"),
  };
}

const selectEmployeeSql = `
  SELECT
    e.*,
    d.name AS department_name,
    des.name AS designation_name,
    COALESCE(ce.name, cu.username) AS created_by_user_name,
    COALESCE(ue.name, uu.username) AS updated_by_user_name
  FROM employees e
  LEFT JOIN companies f ON f.id = e.company_id
  LEFT JOIN departments d ON d.id = e.department_id
  LEFT JOIN designations des ON des.id = e.designation_id
  LEFT JOIN users cu ON cu.id = e.created_by_user_id
  LEFT JOIN employees ce ON ce.id = cu.employee_id
  LEFT JOIN users uu ON uu.id = e.updated_by_user_id
  LEFT JOIN employees ue ON ue.id = uu.employee_id
`;

async function getEmployeeRow(id, db = { query }) {
  const result = await db.query(`${selectEmployeeSql} WHERE e.id::text = $1`, [String(id)]);
  return result.rows[0] || null;
}

employeesRouter.get("/lookups/options", async (_req, res, next) => {
  try {
    await ensureReady();
    const [companiesResult, departmentsResult, designationsResult] = await Promise.all([
      query("SELECT id::text AS id, name FROM companies WHERE is_active = 1 ORDER BY name ASC"),
      query("SELECT id::text AS id, name FROM departments WHERE is_active = 1 ORDER BY name ASC"),
      query("SELECT id::text AS id, name FROM designations WHERE is_active = 1 ORDER BY name ASC"),
    ]);

    res.json({
      facilities: companiesResult.rows,
      companies: companiesResult.rows,
      departments: departmentsResult.rows,
      designations: designationsResult.rows,
    });
  } catch (error) {
    next(error);
  }
});

employeesRouter.get("/", requirePermission("settings:employees:read"), async (_req, res, next) => {
  try {
    await ensureReady();
    const result = await query(`${selectEmployeeSql} ORDER BY e.employee_id ASC`);
    res.json(result.rows.map(toEmployee));
  } catch (error) {
    next(error);
  }
});

employeesRouter.get("/:id", requirePermission("settings:employees:read"), async (req, res, next) => {
  try {
    await ensureReady();
    const row = await getEmployeeRow(req.params.id);
    if (!row) return res.status(404).json({ error: "not_found" });
    res.json(toEmployee(row));
  } catch (error) {
    next(error);
  }
});

employeesRouter.post("/", requirePermission("settings:employees:write"), async (req, res, next) => {
  try {
    await ensureReady();
    const employee = normalizeEmployeeInput(req.body || {});
    const actor = await getRequestActor(req);
    const companyId = await getCompanyIdOrThrow(employee.companyId);
    const departmentId = await getIdByValueOrThrow("departments", employee.departmentId, "department");
    const designationId = await getIdByValueOrThrow("designations", employee.designationId, "designation");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `
          INSERT INTO employees (
            employee_id, name, company_id, department_id, designation_id,
            is_active, email, phone, joined_on, created_by_user_id, updated_by_user_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
          RETURNING id
        `,
        [
          employee.employeeId,
          employee.name,
          companyId,
          departmentId,
          designationId,
          employee.status,
          employee.email,
          employee.phone,
          employee.joinedOn,
          actor.id,
        ],
      );

      const created = await getEmployeeRow(result.rows[0].id, client);
      await writeAuditLog(
        {
          tableName: "employees",
          rowId: result.rows[0].id,
          action: "create",
          actorUserId: actor.id,
          oldData: null,
          newData: toEmployee(created),
        },
        client,
      );
      await client.query("COMMIT");
      res.status(201).json(toEmployee(created));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

employeesRouter.put("/:id", requirePermission("settings:employees:update"), async (req, res, next) => {
  try {
    await ensureReady();
    const existing = await getEmployeeRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });

    const employee = normalizeEmployeeInput(req.body || {});
    const actor = await getRequestActor(req);
    const companyId = await getCompanyIdOrThrow(employee.companyId);
    const departmentId = await getIdByValueOrThrow("departments", employee.departmentId, "department");
    const designationId = await getIdByValueOrThrow("designations", employee.designationId, "designation");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `
          UPDATE employees
          SET
            employee_id = $2,
            name = $3,
            company_id = $4,
            department_id = $5,
            designation_id = $6,
            is_active = $7,
            email = $8,
            phone = $9,
            joined_on = $10,
            updated_by_user_id = $11,
            updated_at = NOW()
          WHERE id = $1
        `,
        [
          existing.id,
          employee.employeeId,
          employee.name,
          companyId,
          departmentId,
          designationId,
          employee.status,
          employee.email,
          employee.phone,
          employee.joinedOn,
          actor.id,
        ],
      );

      const updated = await getEmployeeRow(existing.id, client);
      await writeAuditLog(
        {
          tableName: "employees",
          rowId: existing.id,
          action: "update",
          actorUserId: actor.id,
          oldData: toEmployee(existing),
          newData: toEmployee(updated),
        },
        client,
      );
      await client.query("COMMIT");
      res.json(toEmployee(updated));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

employeesRouter.delete("/:id", requirePermission("settings:employees:delete"), async (req, res, next) => {
  try {
    await ensureReady();
    const existing = await getEmployeeRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "not_found" });

    const actor = await getRequestActor(req);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM employees WHERE id = $1", [existing.id]);
      await writeAuditLog(
        {
          tableName: "employees",
          rowId: existing.id,
          action: "delete",
          actorUserId: actor.id,
          oldData: toEmployee(existing),
          newData: null,
        },
        client,
      );
      await client.query("COMMIT");
      res.json({ ok: true });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});
