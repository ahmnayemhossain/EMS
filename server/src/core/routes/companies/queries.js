export const selectCompanySql = `
  SELECT
    f.*,
    COALESCE(ce.name, cu.username) AS created_by_user_name,
    COALESCE(ue.name, uu.username) AS updated_by_user_name
  FROM companies f
  LEFT JOIN users cu ON cu.id = f.created_by_user_id
  LEFT JOIN employees ce ON ce.id = cu.employee_id
  LEFT JOIN users uu ON uu.id = f.updated_by_user_id
  LEFT JOIN employees ue ON ue.id = uu.employee_id
`;
