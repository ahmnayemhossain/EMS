export const selectRoleSql = `
  SELECT
    r.*,
    COALESCE(array_remove(array_agg(DISTINCT p.key), NULL), ARRAY[]::text[]) AS permission_keys,
    COALESCE(ce.name, cu.username) AS created_by_user_name,
    COALESCE(ue.name, uu.username) AS updated_by_user_name
  FROM roles r
  LEFT JOIN role_permissions rp ON rp.role_id = r.id
  LEFT JOIN permissions p ON p.id = rp.permission_id
  LEFT JOIN users cu ON cu.id = r.created_by_user_id
  LEFT JOIN employees ce ON ce.id = cu.employee_id
  LEFT JOIN users uu ON uu.id = r.updated_by_user_id
  LEFT JOIN employees ue ON ue.id = uu.employee_id
`;
