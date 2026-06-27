import { query } from "./postgres.js";

function toFlag(value) {
  return Number(value) === 1;
}

function mapStep(row) {
  return {
    key: row.key,
    name: row.name,
    sortOrder: Number(row.sort_order || 0),
    isInitial: toFlag(row.is_initial),
    isFinal: toFlag(row.is_final),
    isActive: toFlag(row.is_active),
  };
}

function mapTransition(row) {
  return {
    key: row.key,
    name: row.name,
    fromStepKey: row.from_step_key,
    toStepKey: row.to_step_key,
    isActive: toFlag(row.is_active),
  };
}

function mapGroup(row, steps, transitions) {
  return {
    key: row.key,
    name: row.name,
    moduleKey: row.module_key,
    description: row.description || "",
    isDefault: toFlag(row.is_default),
    isActive: toFlag(row.is_active),
    stepKeys: steps
      .filter((item) => item.workflow_key === row.key)
      .sort((left, right) => Number(left.sort_order || 0) - Number(right.sort_order || 0))
      .map((item) => item.key),
    transitionKeys: transitions
      .filter((item) => item.workflow_key === row.key)
      .map((item) => item.key),
  };
}

function toRoleMappings(rows) {
  const byKey = new Map();
  for (const row of rows) {
    const key = `${row.workflow_key}|${row.role_id}`;
    const existing = byKey.get(key) || {
      groupKey: row.workflow_key,
      roleId: String(row.role_id),
      transitionKeys: [],
    };
    existing.transitionKeys.push(row.transition_key);
    byKey.set(key, existing);
  }
  return Array.from(byKey.values());
}

function toUserMappings(rows) {
  const byKey = new Map();
  for (const row of rows) {
    const key = `${row.workflow_key}|${row.user_id}`;
    const existing = byKey.get(key) || {
      groupKey: row.workflow_key,
      userId: String(row.user_id),
      transitionKeys: [],
    };
    existing.transitionKeys.push(row.transition_key);
    byKey.set(key, existing);
  }
  return Array.from(byKey.values());
}

function buildTransitionKey(fromStepKey, toStepKey) {
  return `${fromStepKey}_to_${toStepKey}`;
}

function buildStepOrderTransitions(steps) {
  const ordered = steps
    .map(mapStep)
    .filter((row) => row.isActive)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const transitions = [];
  for (let index = 0; index < ordered.length - 1; index += 1) {
    const current = ordered[index];
    const next = ordered[index + 1];
    transitions.push({
      key: buildTransitionKey(current.key, next.key),
      name: `${current.name} to ${next.name}`,
      fromStepKey: current.key,
      toStepKey: next.key,
      isActive: true,
    });
    transitions.push({
      key: buildTransitionKey(next.key, current.key),
      name: `${next.name} to ${current.name}`,
      fromStepKey: next.key,
      toStepKey: current.key,
      isActive: true,
    });
  }
  return transitions;
}

async function hasUserTransitionMapping(workflowKey, userId, db = { query }) {
  const result = await db.query(
    `SELECT 1
       FROM workflow_user_assignments
      WHERE workflow_key = $1 AND user_id = $2
      LIMIT 1`,
    [workflowKey, userId],
  );
  return result.rowCount > 0;
}

async function isAdminUser(userId, db = { query }) {
  const result = await db.query(
    `SELECT 1
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = $1
        AND r.is_active = 1
        AND lower(trim(r.name)) = 'admin'
      LIMIT 1`,
    [userId],
  );
  return result.rowCount > 0;
}

export async function listApprovalHierarchyConfig(db = { query }) {
  const [allStepsRes, allTransitionsRes, groupsRes, roleAssignmentsRes, userAssignmentsRes, rolesRes] =
    await Promise.all([
      db.query(`SELECT * FROM workflow_steps ORDER BY workflow_key ASC, sort_order ASC, name ASC`),
      db.query(`SELECT * FROM workflow_transitions ORDER BY workflow_key ASC, name ASC`),
      db.query(`SELECT * FROM workflow_definitions ORDER BY module_key ASC, name ASC`),
      db.query(
        `SELECT * FROM workflow_role_assignments ORDER BY workflow_key ASC, role_id ASC, transition_key ASC`,
      ),
      db.query(
        `SELECT * FROM workflow_user_assignments ORDER BY workflow_key ASC, user_id ASC, transition_key ASC`,
      ),
      db.query(`SELECT id::text AS id, name FROM roles WHERE is_active = 1 ORDER BY name ASC`),
    ]);

  const uniqueSteps = Array.from(
    new Map(allStepsRes.rows.map((row) => [row.key, row])).values(),
  );
  const uniqueTransitions = Array.from(
    new Map(allTransitionsRes.rows.map((row) => [row.key, row])).values(),
  );

  return {
    steps: uniqueSteps.map(mapStep),
    transitions: uniqueTransitions.map(mapTransition),
    groups: groupsRes.rows.map((row) => mapGroup(row, allStepsRes.rows, allTransitionsRes.rows)),
    roleMappings: toRoleMappings(roleAssignmentsRes.rows),
    userMappings: toUserMappings(userAssignmentsRes.rows),
    roles: rolesRes.rows.map((row) => ({ id: row.id, name: row.name })),
  };
}

export async function getDefaultApprovalGroup(moduleKey, db = { query }) {
  const result = await db.query(
    `SELECT *
       FROM workflow_definitions
      WHERE module_key = $1 AND is_active = 1
      ORDER BY is_default DESC, name ASC
      LIMIT 1`,
    [moduleKey],
  );
  return result.rows[0] || null;
}

export async function listUserGroupTransitions({ moduleKey, userId }, db = { query }) {
  const group = await getDefaultApprovalGroup(moduleKey, db);
  if (!group) {
    return {
      group: null,
      steps: [],
      transitions: [],
    };
  }

  const isAdmin = await isAdminUser(userId, db);
  const useUserMappings = await hasUserTransitionMapping(group.key, userId, db);
  const stepsRes = await db.query(
    `SELECT *
       FROM workflow_steps
      WHERE workflow_key = $1
        AND is_active = 1
      ORDER BY sort_order ASC, name ASC`,
    [group.key],
  );

  const transitionsRes = isAdmin
    ? null
    : useUserMappings
      ? await db.query(
          `SELECT t.*
             FROM workflow_transitions t
             JOIN workflow_user_assignments ua
               ON ua.workflow_key = t.workflow_key
              AND ua.transition_key = t.key
            WHERE t.workflow_key = $1
              AND ua.user_id = $2
              AND t.is_active = 1
            ORDER BY t.name ASC`,
          [group.key, userId],
        )
      : await db.query(
          `SELECT DISTINCT t.*
             FROM workflow_transitions t
             JOIN workflow_role_assignments ra
               ON ra.workflow_key = t.workflow_key
              AND ra.transition_key = t.key
            WHERE t.workflow_key = $1
              AND ra.role_id IN (SELECT role_id FROM user_roles WHERE user_id = $2)
              AND t.is_active = 1
            ORDER BY t.name ASC`,
          [group.key, userId],
        );

  return {
    group: {
      key: group.key,
      name: group.name,
      moduleKey: group.module_key,
      description: group.description || "",
      isDefault: toFlag(group.is_default),
      isActive: toFlag(group.is_active),
    },
    steps: stepsRes.rows.map(mapStep),
    transitions: isAdmin
      ? buildStepOrderTransitions(stepsRes.rows)
      : transitionsRes.rows.map(mapTransition),
  };
}

export async function getAllowedTransition({ moduleKey, userId, transitionKey, fromStepKey }, db = { query }) {
  const group = await getDefaultApprovalGroup(moduleKey, db);
  if (!group) return null;

  const isAdmin = await isAdminUser(userId, db);
  if (isAdmin) {
    const stepsRes = await db.query(
      `SELECT *
         FROM workflow_steps
        WHERE workflow_key = $1
          AND is_active = 1
        ORDER BY sort_order ASC, name ASC`,
      [group.key],
    );
    return (
      buildStepOrderTransitions(stepsRes.rows).find(
        (transition) => transition.key === transitionKey && transition.fromStepKey === fromStepKey,
      ) || null
    );
  }

  const useUserMappings = await hasUserTransitionMapping(group.key, userId, db);
  const result = useUserMappings
    ? await db.query(
        `SELECT t.*
           FROM workflow_transitions t
           JOIN workflow_user_assignments ua
             ON ua.workflow_key = t.workflow_key
            AND ua.transition_key = t.key
          WHERE t.workflow_key = $1
            AND ua.user_id = $4
            AND t.key = $2
            AND t.from_step_key = $3
            AND t.is_active = 1
          LIMIT 1`,
        [group.key, transitionKey, fromStepKey, userId],
      )
    : await db.query(
        `SELECT DISTINCT t.*
           FROM workflow_transitions t
           JOIN workflow_role_assignments ra
             ON ra.workflow_key = t.workflow_key
            AND ra.transition_key = t.key
          WHERE t.workflow_key = $1
            AND ra.role_id IN (SELECT role_id FROM user_roles WHERE user_id = $4)
            AND t.key = $2
            AND t.from_step_key = $3
            AND t.is_active = 1
          LIMIT 1`,
        [group.key, transitionKey, fromStepKey, userId],
      );

  return result.rows[0] ? mapTransition(result.rows[0]) : null;
}

export async function getUserWorkflowAccess({ moduleKey, userId }, db = { query }) {
  return listUserGroupTransitions({ moduleKey, userId }, db);
}
