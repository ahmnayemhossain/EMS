export const selectUserSql = `
  SELECT
    u.*,
    e.id AS employee_db_id,
    e.employee_id AS employee_number,
    e.name AS employee_name,
    f.id AS company_id,
    f.name AS company_name,
    COALESCE(ce.name, cu.username) AS created_by_user_name,
    COALESCE(ue.name, uu.username) AS updated_by_user_name,
    COALESCE(array_remove(array_agg(DISTINCT ur.role_id), NULL), ARRAY[]::bigint[]) AS role_ids,
    COALESCE(array_remove(array_agg(DISTINCT uf.company_id), NULL), ARRAY[]::bigint[]) AS company_access_ids
  FROM users u
  LEFT JOIN employees e ON e.id = u.employee_id
  LEFT JOIN companies f ON f.id = e.company_id
  LEFT JOIN user_roles ur ON ur.user_id = u.id
  LEFT JOIN roles r ON r.id = ur.role_id
  LEFT JOIN user_companies uf ON uf.user_id = u.id
  LEFT JOIN users cu ON cu.id = u.created_by_user_id
  LEFT JOIN employees ce ON ce.id = cu.employee_id
  LEFT JOIN users uu ON uu.id = u.updated_by_user_id
  LEFT JOIN employees ue ON ue.id = uu.employee_id
`;
