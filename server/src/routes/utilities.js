import { Router } from "express";

import {
  ensureCoreSchema,
  getFacilityIdByValue,
  getRequestUserValue,
  getUserIdByValue,
} from "../shared/schema.js";
import { requirePermission } from "../shared/permissions.js";
import { query } from "../shared/postgres.js";

const VALID_TYPES = new Set(["electricity", "water", "fuel", "steam", "refrigerant", "other"]);
const VALID_UNITS = new Set(["kWh", "m3", "L", "kg", "Nm3"]);
const VALID_FLAGS = new Set(["normal", "watch", "high"]);
const VALID_STATUSES = new Set(["normal", "watch", "high", "alert"]);

export const utilitiesRouter = Router();

let readyPromise;

function ensureReady() {
  if (!readyPromise) {
    readyPromise = (async () => {
      await ensureCoreSchema();
      await query(`
        CREATE TABLE IF NOT EXISTS utility_records (
          id BIGSERIAL PRIMARY KEY,
          facility_id BIGINT NOT NULL REFERENCES companies(id) ON UPDATE CASCADE ON DELETE RESTRICT,
          type TEXT NOT NULL,
          period_start DATE NOT NULL,
          period_end DATE NOT NULL,
          meter_name TEXT NOT NULL,
          previous_reading NUMERIC,
          current_reading NUMERIC,
          uom TEXT NOT NULL,
          value NUMERIC NOT NULL,
          baseline_value NUMERIC,
          min_threshold NUMERIC,
          max_threshold NUMERIC,
          variance NUMERIC,
          variance_percent NUMERIC,
          variance_flag TEXT,
          status TEXT,
          remarks TEXT,
          bill_files JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
          updated_by_user_id BIGINT REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_utility_records_type ON utility_records(type);
        CREATE INDEX IF NOT EXISTS idx_utility_records_facility_id ON utility_records(facility_id);
        CREATE INDEX IF NOT EXISTS idx_utility_records_period_start ON utility_records(period_start);
      `);
    })();
  }

  return readyPromise;
}

function toDateString(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toNumber(value) {
  if (value === null || typeof value === "undefined") return undefined;
  const next = Number(value);
  return Number.isFinite(next) ? next : undefined;
}

function rowToRecord(row) {
  return {
    id: Number(row.id),
    facilityId: String(row.facility_id),
    type: row.type,
    periodStart: toDateString(row.period_start),
    periodEnd: toDateString(row.period_end),
    meterName: row.meter_name,
    previousReading: toNumber(row.previous_reading),
    currentReading: toNumber(row.current_reading),
    uom: row.uom,
    value: Number(row.value),
    baselineValue: toNumber(row.baseline_value),
    minThreshold: toNumber(row.min_threshold),
    maxThreshold: toNumber(row.max_threshold),
    variance: toNumber(row.variance),
    variancePercent: toNumber(row.variance_percent),
    varianceFlag: row.variance_flag || undefined,
    status: row.status || undefined,
    remarks: row.remarks || undefined,
    billFiles: Array.isArray(row.bill_files) ? row.bill_files : [],
    createdByUserId: row.created_by_user_id ? String(row.created_by_user_id) : undefined,
    updatedByUserId: row.updated_by_user_id ? String(row.updated_by_user_id) : undefined,
  };
}

function requiredString(input, key, label) {
  const value = String(input[key] || "").trim();
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

function requiredNumber(input, key, label) {
  const value = Number(input[key]);
  if (!Number.isFinite(value)) throw new Error(`${label} must be a number.`);
  return value;
}

function optionalNumber(input, key) {
  if (input[key] === null || typeof input[key] === "undefined" || input[key] === "") return null;
  const value = Number(input[key]);
  if (!Number.isFinite(value)) throw new Error(`${key} must be a number.`);
  return value;
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function isDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeRecordInput(input) {
  const facilityId = requiredString(input, "facilityId", "facilityId");
  const type = requiredString(input, "type", "type");
  const periodStart = requiredString(input, "periodStart", "periodStart");
  const periodEnd = requiredString(input, "periodEnd", "periodEnd");
  const meterName = requiredString(input, "meterName", "meterName");
  const uom = requiredString(input, "uom", "uom");
  const value = requiredNumber(input, "value", "value");

  if (!VALID_TYPES.has(type)) throw new Error("Invalid utility type.");
  if (!VALID_UNITS.has(uom)) throw new Error("Invalid utility unit.");
  if (!isDateString(periodStart) || !isDateString(periodEnd)) {
    throw new Error("Period start and end must be valid YYYY-MM-DD dates.");
  }
  if (periodEnd < periodStart) throw new Error("Period end must be after period start.");
  if (value <= 0) throw new Error("value must be greater than 0.");

  const varianceFlag = input.varianceFlag ? String(input.varianceFlag) : null;
  const status = input.status ? String(input.status) : null;
  const billFiles = Array.isArray(input.billFiles) ? input.billFiles : [];

  if (varianceFlag && !VALID_FLAGS.has(varianceFlag)) throw new Error("Invalid varianceFlag.");
  if (status && !VALID_STATUSES.has(status)) throw new Error("Invalid status.");

  return {
    id: optionalNumber(input, "id"),
    facilityId,
    type,
    periodStart,
    periodEnd,
    meterName,
    previousReading: optionalNumber(input, "previousReading"),
    currentReading: optionalNumber(input, "currentReading"),
    uom,
    value,
    baselineValue: optionalNumber(input, "baselineValue"),
    minThreshold: optionalNumber(input, "minThreshold"),
    maxThreshold: optionalNumber(input, "maxThreshold"),
    variance: optionalNumber(input, "variance"),
    variancePercent: optionalNumber(input, "variancePercent"),
    varianceFlag,
    status,
    remarks: input.remarks ? String(input.remarks).trim() : null,
    billFiles,
  };
}

async function findOverlappingRecord(record, facilityDbId, excludeId) {
  const params = [
    facilityDbId,
    record.type,
    record.meterName.trim().toLowerCase(),
    record.periodStart,
    record.periodEnd,
  ];
  const excludeClause = excludeId ? `AND id <> $6` : "";
  if (excludeId) params.push(excludeId);

  const result = await query(
    `
      SELECT id, period_start, period_end, meter_name
      FROM utility_records
      WHERE facility_id = $1
        AND type = $2
        AND lower(trim(meter_name)) = $3
        AND period_start <= $5::date
        AND period_end >= $4::date
        ${excludeClause}
      ORDER BY period_start DESC
      LIMIT 1
    `,
    params,
  );

  return result.rows[0] || null;
}

async function assertNoDateRangeOverlap(record, facilityDbId, excludeId) {
  const overlap = await findOverlappingRecord(record, facilityDbId, excludeId);
  if (!overlap) return;

  throw createHttpError(
    409,
    `An entry already exists for this company, utility type, meter, and date range (${toDateString(overlap.period_start)} to ${toDateString(overlap.period_end)}).`,
  );
}

async function assertUserCompanyAccess(userId, companyId) {
  if (!userId) throw createHttpError(403, "Company access is required.");

  const result = await query(
    `
      SELECT 1
      FROM user_companies
      WHERE user_id = $1
        AND company_id = $2
      LIMIT 1
    `,
    [userId, companyId],
  );

  if (!result.rowCount) throw createHttpError(403, "You do not have access to this company.");
}

const selectUtilitySql = `
  SELECT
    ur.*,
    f.name AS facility_name,
    cu.username AS created_by_username,
    uu.username AS updated_by_username
  FROM utility_records ur
  JOIN companies f ON f.id = ur.facility_id
  LEFT JOIN users cu ON cu.id = ur.created_by_user_id
  LEFT JOIN users uu ON uu.id = ur.updated_by_user_id
`;

utilitiesRouter.get("/", requirePermission("utilities:read"), async (req, res, next) => {
  try {
    await ensureReady();

    const filters = [];
    const params = [];
    const userDbId = await getUserIdByValue(getRequestUserValue(req));

    params.push(userDbId || -1);
    filters.push(`
      EXISTS (
        SELECT 1
        FROM user_companies uf
        WHERE uf.user_id = $${params.length}
          AND uf.company_id = ur.facility_id
      )
    `);

    if (req.query.type) {
      params.push(String(req.query.type));
      filters.push(`ur.type = $${params.length}`);
    }

    if (req.query.facilityId) {
      const facilityDbId = await getFacilityIdByValue(String(req.query.facilityId));
      params.push(facilityDbId || -1);
      filters.push(`ur.facility_id = $${params.length}`);
    }

    if (req.query.search) {
      params.push(`%${String(req.query.search).trim()}%`);
      filters.push(`ur.meter_name ILIKE $${params.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const result = await query(
      `
        ${selectUtilitySql}
        ${where}
        ORDER BY ur.period_start DESC, ur.created_at DESC
      `,
      params,
    );

    res.json(result.rows.map(rowToRecord));
  } catch (error) {
    next(error);
  }
});

utilitiesRouter.get("/:id", requirePermission("utilities:read"), async (req, res, next) => {
  try {
    await ensureReady();
    const userDbId = await getUserIdByValue(getRequestUserValue(req));
    const result = await query(
      `
        ${selectUtilitySql}
        WHERE ur.id = $1
          AND EXISTS (
            SELECT 1
            FROM user_companies uf
            WHERE uf.user_id = $2
              AND uf.company_id = ur.facility_id
          )
      `,
      [req.params.id, userDbId || -1],
    );
    if (!result.rowCount) return res.status(404).json({ error: "not_found" });
    res.json(rowToRecord(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

utilitiesRouter.post("/", requirePermission("utilities:write"), async (req, res, next) => {
  try {
    await ensureReady();
    const record = normalizeRecordInput(req.body || {});
    const facilityDbId = await getFacilityIdByValue(record.facilityId);
    if (!facilityDbId) throw createHttpError(400, "Invalid facility.");

    const userDbId = await getUserIdByValue(getRequestUserValue(req));
    await assertUserCompanyAccess(userDbId, facilityDbId);
    await assertNoDateRangeOverlap(record, facilityDbId);

    const result = await query(
      `
        INSERT INTO utility_records (
          facility_id, type, period_start, period_end, meter_name,
          previous_reading, current_reading, uom, value, baseline_value,
          min_threshold, max_threshold, variance, variance_percent,
          variance_flag, status, remarks, bill_files, created_by_user_id, updated_by_user_id
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17, $18::jsonb, $19, $19
        )
        RETURNING *
      `,
      [
        facilityDbId,
        record.type,
        record.periodStart,
        record.periodEnd,
        record.meterName,
        record.previousReading,
        record.currentReading,
        record.uom,
        record.value,
        record.baselineValue,
        record.minThreshold,
        record.maxThreshold,
        record.variance,
        record.variancePercent,
        record.varianceFlag,
        record.status,
        record.remarks,
        JSON.stringify(record.billFiles),
        userDbId,
      ],
    );

    const created = await query(`${selectUtilitySql} WHERE ur.id = $1`, [result.rows[0].id]);
    res.status(201).json(rowToRecord(created.rows[0]));
  } catch (error) {
    next(error);
  }
});

utilitiesRouter.put("/:id", requirePermission("utilities:update"), async (req, res, next) => {
  try {
    await ensureReady();
    const record = normalizeRecordInput({ ...req.body, id: req.params.id });
    const facilityDbId = await getFacilityIdByValue(record.facilityId);
    if (!facilityDbId) throw createHttpError(400, "Invalid facility.");

    const userDbId = await getUserIdByValue(getRequestUserValue(req));
    await assertUserCompanyAccess(userDbId, facilityDbId);
    await assertNoDateRangeOverlap(record, facilityDbId, record.id);

    const result = await query(
      `
        UPDATE utility_records
        SET
          facility_id = $2,
          type = $3,
          period_start = $4,
          period_end = $5,
          meter_name = $6,
          previous_reading = $7,
          current_reading = $8,
          uom = $9,
          value = $10,
          baseline_value = $11,
          min_threshold = $12,
          max_threshold = $13,
          variance = $14,
          variance_percent = $15,
          variance_flag = $16,
          status = $17,
          remarks = $18,
          bill_files = $19::jsonb,
          updated_by_user_id = $20,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [
        record.id,
        facilityDbId,
        record.type,
        record.periodStart,
        record.periodEnd,
        record.meterName,
        record.previousReading,
        record.currentReading,
        record.uom,
        record.value,
        record.baselineValue,
        record.minThreshold,
        record.maxThreshold,
        record.variance,
        record.variancePercent,
        record.varianceFlag,
        record.status,
        record.remarks,
        JSON.stringify(record.billFiles),
        userDbId,
      ],
    );

    if (!result.rowCount) return res.status(404).json({ error: "not_found" });
    const updated = await query(`${selectUtilitySql} WHERE ur.id = $1`, [record.id]);
    res.json(rowToRecord(updated.rows[0]));
  } catch (error) {
    next(error);
  }
});

utilitiesRouter.delete("/:id", requirePermission("utilities:delete"), async (req, res, next) => {
  try {
    await ensureReady();
    const userDbId = await getUserIdByValue(getRequestUserValue(req));
    const result = await query(
      `
        DELETE FROM utility_records ur
        WHERE ur.id = $1
          AND EXISTS (
            SELECT 1
            FROM user_companies uf
            WHERE uf.user_id = $2
              AND uf.company_id = ur.facility_id
          )
      `,
      [req.params.id, userDbId || -1],
    );
    if (!result.rowCount) return res.status(404).json({ error: "not_found" });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
