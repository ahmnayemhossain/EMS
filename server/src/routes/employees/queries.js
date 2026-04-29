export const selectEmployeeSql = `
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
