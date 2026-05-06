import { Router } from "express";

import { auditLogsRouter } from "./audit-logs.js";
import { employeesRouter } from "./employees.js";
import { companiesRouter } from "./companies.js";
import { createReferenceSettingsRouter } from "./reference-settings.js";
import { metersRouter } from "./meters.js";
import { rolesRouter } from "./roles.js";
import { sourceWiringRouter } from "./source-wiring.js";
import { uomWiringRouter } from "./uom-wiring.js";
import { usersRouter } from "./users.js";
import { ensureCoreSchema, getRequestUserValue, getUserIdByValue } from "../shared/schema.js";
import { query } from "../shared/postgres.js";

export const systemRouter = Router();

systemRouter.get("/me", async (req, res, next) => {
  try {
    await ensureCoreSchema();
    const requestUser = getRequestUserValue(req);
    const userId = await getUserIdByValue(requestUser);

    if (!userId) {
      return res.json({
        id: null,
        requestUser,
        permissionKeys: [],
      });
    }

    const result = await query(
      `
        SELECT
          u.id::text AS id,
          u.username,
          u.email,
          COALESCE(e.name, u.username) AS name,
          COALESCE(
            array_remove(array_agg(DISTINCT p.key), NULL),
            ARRAY[]::text[]
          ) AS permission_keys
        FROM users u
        LEFT JOIN employees e ON e.id = u.employee_id
        LEFT JOIN user_roles ur ON ur.user_id = u.id
        LEFT JOIN role_permissions rp ON rp.role_id = ur.role_id
        LEFT JOIN permissions p ON p.id = rp.permission_id
        WHERE u.id = $1
        GROUP BY u.id, e.id
      `,
      [userId],
    );

    const row = result.rows[0];
    res.json({
      id: row?.id || String(userId),
      username: row?.username,
      email: row?.email,
      name: row?.name,
      requestUser,
      permissionKeys: Array.isArray(row?.permission_keys) ? row.permission_keys : [],
    });
  } catch (error) {
    next(error);
  }
});

systemRouter.use("/employees", employeesRouter);
systemRouter.use("/audit-logs", auditLogsRouter);
systemRouter.use("/users", usersRouter);
systemRouter.use("/roles", rolesRouter);
systemRouter.use("/companies", companiesRouter);
systemRouter.use("/factories", companiesRouter);
systemRouter.use("/departments", createReferenceSettingsRouter("departments"));
systemRouter.use("/designations", createReferenceSettingsRouter("designations"));
systemRouter.use("/uom", createReferenceSettingsRouter("uom"));
systemRouter.use("/uom-wiring", uomWiringRouter);
systemRouter.use("/sources", createReferenceSettingsRouter("sources"));
systemRouter.use("/source-wiring", sourceWiringRouter);
systemRouter.use("/suppliers", createReferenceSettingsRouter("suppliers"));
systemRouter.use("/meters", metersRouter);
