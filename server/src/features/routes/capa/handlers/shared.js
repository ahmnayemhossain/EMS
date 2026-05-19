import { createHttpError } from "../../../modules/utilities/record.js";

export const capaStatuses = ["open", "in_progress", "pending_verification", "closed", "overdue"];
export const capaSeverities = ["minor", "major", "critical"];

export const selectCapaSql = `
  SELECT
    c.id,
    c.facility_id,
    c.title,
    c.description,
    c.owner_name,
    c.severity,
    c.status,
    c.due_date,
    c.evidence_count,
    c.related_finding_id,
    c.position_index,
    c.is_dismissed,
    c.dismissed_at,
    c.created_at,
    c.updated_at
  FROM capa_records c
`;

export function normalizeCapaInput(body = {}) {
  const facilityId = String(body.facilityId ?? "").trim();
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const owner = String(body.owner ?? "").trim();
  const severity = String(body.severity ?? "major").trim();
  const status = String(body.status ?? "open").trim();
  const dueDate = String(body.dueDate ?? "").trim();
  const relatedFindingId = String(body.relatedFindingId ?? "").trim();
  const evidenceCountRaw = Number(body.evidenceCount ?? 0);
  const evidenceCount = Number.isFinite(evidenceCountRaw) ? Math.max(0, Math.trunc(evidenceCountRaw)) : 0;

  if (!facilityId) throw createHttpError(400, "facilityId is required.");
  if (!title) throw createHttpError(400, "title is required.");
  if (!owner) throw createHttpError(400, "owner is required.");
  if (!capaSeverities.includes(severity)) throw createHttpError(400, "Invalid severity.");
  if (!capaStatuses.includes(status)) throw createHttpError(400, "Invalid status.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) throw createHttpError(400, "dueDate must be YYYY-MM-DD.");

  return {
    facilityId,
    title,
    description: description || null,
    owner,
    severity,
    status,
    dueDate,
    evidenceCount,
    relatedFindingId: relatedFindingId || null,
  };
}

export function normalizeCapaMoveInput(body = {}) {
  const facilityId = String(body.facilityId ?? "").trim();
  const status = String(body.status ?? "").trim();
  const targetIndexRaw = Number(body.targetIndex ?? 0);
  const targetIndex = Number.isFinite(targetIndexRaw) ? Math.max(0, Math.trunc(targetIndexRaw)) : 0;

  if (!facilityId) throw createHttpError(400, "facilityId is required.");
  if (!capaStatuses.includes(status)) throw createHttpError(400, "Invalid status.");

  return { facilityId, status, targetIndex };
}

export function rowToCapa(row) {
  return {
    id: String(row.id),
    facilityId: String(row.facility_id),
    title: row.title,
    description: row.description ?? "",
    owner: row.owner_name,
    severity: row.severity,
    status: row.status,
    dueDate: row.due_date,
    evidenceCount: Number(row.evidence_count ?? 0),
    relatedFindingId: row.related_finding_id ?? undefined,
    positionIndex: Number(row.position_index ?? 0),
    dismissed: Number(row.is_dismissed ?? 0) === 1,
  };
}

export async function getCapaById(client, id) {
  const result = await client.query(`${selectCapaSql} WHERE c.id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function getNextPositionIndex(client, facilityId, status) {
  const result = await client.query(
    `SELECT COALESCE(MAX(position_index), -1) + 1 AS next_position FROM capa_records WHERE facility_id = $1 AND status = $2`,
    [facilityId, status],
  );
  return Number(result.rows[0]?.next_position ?? 0);
}

export async function reorderStatusColumn(client, facilityId, status, orderedIds, userDbId) {
  for (let index = 0; index < orderedIds.length; index += 1) {
    await client.query(
      `UPDATE capa_records SET position_index = $2, updated_by_user_id = $3, updated_at = NOW() WHERE id = $1 AND facility_id = $4 AND status = $5`,
      [orderedIds[index], index, userDbId, facilityId, status],
    );
  }
}

export async function loadOrderedIds(client, facilityId, status, excludeId) {
  const params = [facilityId, status];
  let sql = `
    SELECT id
    FROM capa_records
    WHERE facility_id = $1
      AND status = $2
      AND is_dismissed = 0
  `;

  if (excludeId != null) {
    params.push(excludeId);
    sql += ` AND id <> $${params.length}`;
  }

  sql += ` ORDER BY position_index ASC, updated_at ASC, due_date ASC, id ASC`;

  const result = await client.query(sql, params);
  return result.rows.map((row) => Number(row.id));
}
