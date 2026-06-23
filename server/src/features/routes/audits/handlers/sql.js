export const selectAuditSql = `
  SELECT
    ar.*,
    co.name AS company_name
  FROM audit_records ar
  JOIN companies co ON co.id = ar.facility_id
`;
