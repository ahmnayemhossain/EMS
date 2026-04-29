import { Router } from "express";
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";

import {
  ensureCoreSchema,
  getFacilityIdByValue,
  getRequestUserValue,
  getUserIdByValue,
} from "../shared/schema.js";
import { requirePermission } from "../shared/permissions.js";
import { query } from "../shared/postgres.js";
import {
  ensureDirectory,
  MAX_PDF_BYTES,
  removeFileIfExists,
  resolveCdnPath,
  sanitizeFilePart,
  toCdnUrl,
} from "../shared/storage.js";

const VALID_TYPES = new Set(["electricity", "water", "fuel", "steam", "refrigerant", "other"]);
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
          source_id BIGINT REFERENCES sources(id) ON UPDATE CASCADE ON DELETE SET NULL,
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
        ALTER TABLE utility_records ADD COLUMN IF NOT EXISTS source_id BIGINT REFERENCES sources(id) ON UPDATE CASCADE ON DELETE SET NULL;
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
    sourceId: row.source_id ? String(row.source_id) : undefined,
    sourceName: row.source_name || undefined,
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

function rowToUomOption(row) {
  return {
    id: String(row.id),
    name: row.name,
    utilityType: row.utility_type_key,
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
  const sourceId = input.sourceId ? String(input.sourceId).trim() : null;

  if (!VALID_TYPES.has(type)) throw new Error("Invalid utility type.");
  if (!isDateString(periodStart) || !isDateString(periodEnd)) {
    throw new Error("Period start and end must be valid YYYY-MM-DD dates.");
  }
  if (periodEnd < periodStart) throw new Error("Period end must be after period start.");
  if (value <= 0) throw new Error("value must be greater than 0.");

  const varianceFlag = input.varianceFlag ? String(input.varianceFlag) : null;
  const status = input.status ? String(input.status) : null;
  if (varianceFlag && !VALID_FLAGS.has(varianceFlag)) throw new Error("Invalid varianceFlag.");
  if (status && !VALID_STATUSES.has(status)) throw new Error("Invalid status.");

  return {
    id: optionalNumber(input, "id"),
    facilityId,
    type,
    sourceId,
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
  };
}

function normalizeAttachmentInput(input) {
  const fileName = requiredString(input, "fileName", "fileName");
  const mimeType = requiredString(input, "mimeType", "mimeType").toLowerCase();
  const dataBase64 = requiredString(input, "dataBase64", "dataBase64").replace(/^data:application\/pdf;base64,/i, "");

  if (mimeType !== "application/pdf") throw createHttpError(400, "Only PDF files are allowed.");
  if (!/\.pdf$/i.test(fileName)) throw createHttpError(400, "File name must end with .pdf.");

  const buffer = Buffer.from(dataBase64, "base64");
  if (!buffer.length) throw createHttpError(400, "Attachment content is required.");
  if (buffer.length > MAX_PDF_BYTES) throw createHttpError(400, "PDF file is too large. Maximum size is 10 MB.");
  if (buffer.subarray(0, 4).toString("utf8") !== "%PDF") throw createHttpError(400, "Uploaded file is not a valid PDF.");

  return { fileName, mimeType, buffer };
}

async function isAllowedUom(type, uom) {
  const result = await query(
    `
      SELECT 1
      FROM uom_wiring uw
      JOIN uom u ON u.id = uw.uom_id
      JOIN utility_types ut ON ut.id = uw.utility_type_id
      WHERE lower(u.name) = lower($1)
        AND ut.key = $2
        AND u.is_active = 1
        AND ut.is_active = 1
        AND uw.is_active = 1
      LIMIT 1
    `,
    [uom, type],
  );

  return result.rowCount > 0;
}

async function isAllowedSource(type, sourceId) {
  if (!sourceId) {
    const result = await query(
      `
        SELECT 1
        FROM source_wiring sw
        JOIN utility_types ut ON ut.id = sw.utility_type_id
        WHERE ut.key = $1
          AND sw.is_active = 1
        LIMIT 1
      `,
      [type],
    );
    return result.rowCount === 0;
  }
  const result = await query(
    `
      SELECT 1
      FROM source_wiring sw
      JOIN sources s ON s.id = sw.source_id
      JOIN utility_types ut ON ut.id = sw.utility_type_id
      WHERE sw.source_id = $1
        AND ut.key = $2
        AND s.is_active = 1
        AND ut.is_active = 1
        AND sw.is_active = 1
      LIMIT 1
    `,
    [sourceId, type],
  );
  return result.rowCount > 0;
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
    s.name AS source_name,
    cu.username AS created_by_username,
    uu.username AS updated_by_username,
    COALESCE(file_assets.files, ur.bill_files, '[]'::jsonb) AS bill_files
  FROM utility_records ur
  JOIN companies f ON f.id = ur.facility_id
  LEFT JOIN sources s ON s.id = ur.source_id
  LEFT JOIN users cu ON cu.id = ur.created_by_user_id
  LEFT JOIN users uu ON uu.id = ur.updated_by_user_id
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', fa.id,
        'name', fa.original_name,
        'storedName', fa.stored_name,
        'mimeType', fa.mime_type,
        'fileSize', fa.file_size,
        'storagePath', fa.storage_path,
        'url', '${toCdnUrl("")}' || fa.storage_path,
        'uploadedAt', fa.created_at
      )
      ORDER BY fa.created_at DESC
    ) AS files
    FROM file_assets fa
    WHERE fa.module = 'utilities'
      AND fa.entity_type = 'utility_record'
      AND fa.entity_id = ur.id
  ) file_assets ON true
`;

async function listUtilityFiles(recordId) {
  const result = await query(
    `
      SELECT *
      FROM file_assets
      WHERE module = 'utilities'
        AND entity_type = 'utility_record'
        AND entity_id = $1
      ORDER BY created_at DESC
    `,
    [recordId],
  );

  return result.rows;
}

async function syncLegacyBillFiles(recordId) {
  await query(
    `
      UPDATE utility_records ur
      SET bill_files = COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', fa.id,
            'name', fa.original_name,
            'storedName', fa.stored_name,
            'mimeType', fa.mime_type,
            'fileSize', fa.file_size,
            'storagePath', fa.storage_path,
            'url', $2 || fa.storage_path,
            'uploadedAt', fa.created_at
          )
          ORDER BY fa.created_at DESC
        )
        FROM file_assets fa
        WHERE fa.module = 'utilities'
          AND fa.entity_type = 'utility_record'
          AND fa.entity_id = $1
      ), '[]'::jsonb),
      updated_at = NOW()
      WHERE ur.id = $1
    `,
    [recordId, toCdnUrl("")],
  );
}

async function removeUtilityFiles(recordId) {
  const files = await listUtilityFiles(recordId);
  for (const file of files) {
    await removeFileIfExists(resolveCdnPath(file.storage_path));
  }
  await query(
    `
      DELETE FROM file_assets
      WHERE module = 'utilities'
        AND entity_type = 'utility_record'
        AND entity_id = $1
    `,
    [recordId],
  );
  await syncLegacyBillFiles(recordId);
}

async function replaceUtilityAttachment(record, attachment, userDbId) {
  await removeUtilityFiles(record.id);

  const now = new Date();
  const year = record.periodStart.slice(0, 4) || String(now.getFullYear());
  const month = record.periodStart.slice(5, 7) || String(now.getMonth() + 1).padStart(2, "0");
  const typeSegment = sanitizeFilePart(record.type);
  const companySegment = `company-${record.facilityId}`;
  const storedName = [
    "utilities",
    typeSegment,
    String(record.id),
    now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14),
    randomUUID().slice(0, 8),
  ].join("_") + ".pdf";
  const relativeDir = ["utilities", companySegment, typeSegment, year, month].join("/");
  const relativePath = `${relativeDir}/${storedName}`;

  await ensureDirectory(resolveCdnPath(relativeDir));
  await writeFile(resolveCdnPath(relativePath), attachment.buffer);

  await query(
    `
      INSERT INTO file_assets (
        module,
        entity_type,
        entity_id,
        company_id,
        original_name,
        stored_name,
        storage_disk,
        storage_path,
        mime_type,
        file_size,
        uploaded_by_user_id
      )
      VALUES (
        'utilities',
        'utility_record',
        $1,
        $2,
        $3,
        $4,
        'local-cdn',
        $5,
        $6,
        $7,
        $8
      )
    `,
    [
      record.id,
      record.facilityId,
      attachment.fileName,
      storedName,
      relativePath,
      attachment.mimeType,
      attachment.buffer.length,
      userDbId,
    ],
  );

  await syncLegacyBillFiles(record.id);

  const updated = await query(`${selectUtilitySql} WHERE ur.id = $1`, [record.id]);
  return rowToRecord(updated.rows[0]);
}

utilitiesRouter.get("/uom-options", requirePermission("utilities:read"), async (req, res, next) => {
  try {
    await ensureReady();
    const params = [];
    const filters = [];

    if (req.query.type) {
      const type = String(req.query.type).trim().toLowerCase();
      if (!VALID_TYPES.has(type)) throw createHttpError(400, "Invalid utility type.");
      params.push(type);
      filters.push(`ut.key = $${params.length}`);
    }

    const result = await query(
      `
        SELECT DISTINCT
          u.id,
          u.name,
          ut.key AS utility_type_key
        FROM uom_wiring uw
        JOIN uom u ON u.id = uw.uom_id
        JOIN utility_types ut ON ut.id = uw.utility_type_id
        WHERE u.is_active = 1
          AND ut.is_active = 1
          AND uw.is_active = 1
          ${filters.length ? `AND ${filters.join(" AND ")}` : ""}
        ORDER BY ut.key ASC, u.name ASC
      `,
      params,
    );

    res.json(result.rows.map(rowToUomOption));
  } catch (error) {
    next(error);
  }
});

utilitiesRouter.get("/source-options", requirePermission("utilities:read"), async (req, res, next) => {
  try {
    await ensureReady();
    const params = [];
    const filters = [];

    if (req.query.type) {
      const type = String(req.query.type).trim().toLowerCase();
      if (!VALID_TYPES.has(type)) throw createHttpError(400, "Invalid utility type.");
      params.push(type);
      filters.push(`ut.key = $${params.length}`);
    }

    const result = await query(
      `
        SELECT DISTINCT
          s.id,
          s.name,
          ut.key AS utility_type_key
        FROM source_wiring sw
        JOIN sources s ON s.id = sw.source_id
        JOIN utility_types ut ON ut.id = sw.utility_type_id
        WHERE s.is_active = 1
          AND ut.is_active = 1
          AND sw.is_active = 1
          ${filters.length ? `AND ${filters.join(" AND ")}` : ""}
        ORDER BY ut.key ASC, s.name ASC
      `,
      params,
    );

    res.json(
      result.rows.map((row) => ({
        id: String(row.id),
        name: row.name,
        utilityType: row.utility_type_key,
      })),
    );
  } catch (error) {
    next(error);
  }
});

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
    if (!(await isAllowedUom(record.type, record.uom))) throw createHttpError(400, "Invalid utility UOM.");
    if (!(await isAllowedSource(record.type, record.sourceId))) throw createHttpError(400, "Invalid utility source.");
    const facilityDbId = await getFacilityIdByValue(record.facilityId);
    if (!facilityDbId) throw createHttpError(400, "Invalid facility.");

    const userDbId = await getUserIdByValue(getRequestUserValue(req));
    await assertUserCompanyAccess(userDbId, facilityDbId);
    await assertNoDateRangeOverlap(record, facilityDbId);

    const result = await query(
      `
        INSERT INTO utility_records (
          facility_id, type, source_id, period_start, period_end, meter_name,
          previous_reading, current_reading, uom, value, baseline_value,
          min_threshold, max_threshold, variance, variance_percent,
          variance_flag, status, remarks, created_by_user_id, updated_by_user_id
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15,
          $16, $17, $18, $19, $19
        )
        RETURNING *
      `,
      [
        facilityDbId,
        record.type,
        record.sourceId,
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
    if (!(await isAllowedUom(record.type, record.uom))) throw createHttpError(400, "Invalid utility UOM.");
    if (!(await isAllowedSource(record.type, record.sourceId))) throw createHttpError(400, "Invalid utility source.");
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
          source_id = $4,
          period_start = $5,
          period_end = $6,
          meter_name = $7,
          previous_reading = $8,
          current_reading = $9,
          uom = $10,
          value = $11,
          baseline_value = $12,
          min_threshold = $13,
          max_threshold = $14,
          variance = $15,
          variance_percent = $16,
          variance_flag = $17,
          status = $18,
          remarks = $19,
          updated_by_user_id = $20,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [
        record.id,
        facilityDbId,
        record.type,
        record.sourceId,
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

utilitiesRouter.post("/:id/attachment", requirePermission("utilities:update"), async (req, res, next) => {
  try {
    await ensureReady();
    const attachment = normalizeAttachmentInput(req.body || {});
    const userDbId = await getUserIdByValue(getRequestUserValue(req));
    const existing = await query(
      `
        ${selectUtilitySql}
        WHERE ur.id = $1
          AND EXISTS (
            SELECT 1
            FROM user_companies uc
            WHERE uc.user_id = $2
              AND uc.company_id = ur.facility_id
          )
      `,
      [req.params.id, userDbId || -1],
    );

    if (!existing.rowCount) return res.status(404).json({ error: "not_found" });
    const updated = await replaceUtilityAttachment(rowToRecord(existing.rows[0]), attachment, userDbId);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

utilitiesRouter.delete("/:id", requirePermission("utilities:delete"), async (req, res, next) => {
  try {
    await ensureReady();
    const userDbId = await getUserIdByValue(getRequestUserValue(req));
    const existing = await query(
      `
        SELECT ur.id
        FROM utility_records ur
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
    if (!existing.rowCount) return res.status(404).json({ error: "not_found" });

    await removeUtilityFiles(Number(req.params.id));
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
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
