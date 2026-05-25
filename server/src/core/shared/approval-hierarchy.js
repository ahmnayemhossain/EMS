import { query } from "./postgres.js";

function toFlag(value) {
  return Number(value) === 1;
}

function toGroupMap(groups, transitions, steps) {
  const byGroup = new Map(
    groups.map((group) => [group.key, { ...group, stepKeys: [], transitionKeys: [] }]),
  );
  for (const item of steps) {
    const group = byGroup.get(item.group_key);
    if (!group) continue;
    group.stepKeys.push(item.step_key);
  }
  for (const item of transitions) {
    const group = byGroup.get(item.group_key);
    if (!group) continue;
    group.transitionKeys.push(item.transition_key);
  }
  return Array.from(byGroup.values()).map((group) => ({
    key: group.key,
    name: group.name,
    moduleKey: group.module_key,
    description: group.description || "",
    isDefault: toFlag(group.is_default),
    isActive: toFlag(group.is_active),
    stepKeys: group.stepKeys,
    transitionKeys: group.transitionKeys,
  }));
}

function toRoleMappings(rows) {
  const byKey = new Map();
  for (const row of rows) {
    const key = `${row.group_key}|${row.role_id}`;
    const existing = byKey.get(key) || {
      groupKey: row.group_key,
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
    const key = `${row.group_key}|${row.user_id}`;
    const existing = byKey.get(key) || {
      groupKey: row.group_key,
      userId: String(row.user_id),
      transitionKeys: [],
    };
    existing.transitionKeys.push(row.transition_key);
    byKey.set(key, existing);
  }
  return Array.from(byKey.values());
}

async function hasUserTransitionMapping(groupKey, userId, db = { query }) {
  const result = await db.query(
    `SELECT 1
       FROM approval_hierarchy_user_transitions
      WHERE group_key = $1 AND user_id = $2
      LIMIT 1`,
    [groupKey, userId],
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
  const [stepsRes, transitionsRes, groupsRes, groupStepsRes, groupTransitionsRes, roleTransitionsRes, userTransitionsRes, rolesRes] = await Promise.all([
    db.query(`SELECT * FROM approval_hierarchy_steps ORDER BY sort_order ASC, name ASC`),
    db.query(`SELECT * FROM approval_hierarchy_transitions ORDER BY name ASC`),
    db.query(`SELECT * FROM approval_hierarchy_groups ORDER BY module_key ASC, name ASC`),
    db.query(`SELECT * FROM approval_hierarchy_group_steps ORDER BY group_key ASC, position_index ASC, step_key ASC`),
    db.query(`SELECT * FROM approval_hierarchy_group_transitions ORDER BY group_key ASC, position_index ASC, transition_key ASC`),
    db.query(`SELECT * FROM approval_hierarchy_role_transitions ORDER BY group_key ASC, role_id ASC, transition_key ASC`),
    db.query(`SELECT * FROM approval_hierarchy_user_transitions ORDER BY group_key ASC, user_id ASC, transition_key ASC`),
    db.query(`SELECT id::text AS id, name FROM roles WHERE is_active = 1 ORDER BY name ASC`),
  ]);

  return {
    steps: stepsRes.rows.map((row) => ({
      key: row.key,
      name: row.name,
      sortOrder: Number(row.sort_order || 0),
      isInitial: toFlag(row.is_initial),
      isFinal: toFlag(row.is_final),
      isActive: toFlag(row.is_active),
    })),
    transitions: transitionsRes.rows.map((row) => ({
      key: row.key,
      name: row.name,
      fromStepKey: row.from_step_key,
      toStepKey: row.to_step_key,
      isActive: toFlag(row.is_active),
    })),
    groups: toGroupMap(groupsRes.rows, groupTransitionsRes.rows, groupStepsRes.rows),
    roleMappings: toRoleMappings(roleTransitionsRes.rows),
    userMappings: toUserMappings(userTransitionsRes.rows),
    roles: rolesRes.rows.map((row) => ({ id: row.id, name: row.name })),
  };
}

export async function getDefaultApprovalGroup(moduleKey, db = { query }) {
  const result = await db.query(
    `SELECT * FROM approval_hierarchy_groups
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
    `SELECT s.*
       FROM approval_hierarchy_group_steps gs
       JOIN approval_hierarchy_steps s ON s.key = gs.step_key
      WHERE gs.group_key = $1
        AND s.is_active = 1
      ORDER BY gs.position_index ASC, s.sort_order ASC, s.name ASC`,
    [group.key],
  );
  const transitionsRes = isAdmin
    ? await db.query(
        `SELECT DISTINCT t.*, gt.position_index
           FROM approval_hierarchy_group_transitions gt
           JOIN approval_hierarchy_transitions t ON t.key = gt.transition_key
          WHERE gt.group_key = $1
            AND t.is_active = 1
          ORDER BY gt.position_index ASC, t.name ASC`,
        [group.key],
      )
    : useUserMappings
    ? await db.query(
        `SELECT t.*
           FROM approval_hierarchy_group_transitions gt
           JOIN approval_hierarchy_transitions t ON t.key = gt.transition_key
           JOIN approval_hierarchy_user_transitions ut
             ON ut.group_key = gt.group_key
            AND ut.transition_key = gt.transition_key
          WHERE gt.group_key = $1
            AND ut.user_id = $2
            AND t.is_active = 1
          ORDER BY gt.position_index ASC, t.name ASC`,
        [group.key, userId],
      )
    : await db.query(
        `SELECT DISTINCT t.*, gt.position_index
           FROM approval_hierarchy_group_transitions gt
           JOIN approval_hierarchy_transitions t ON t.key = gt.transition_key
           JOIN approval_hierarchy_role_transitions rt
             ON rt.group_key = gt.group_key
            AND rt.transition_key = gt.transition_key
          WHERE gt.group_key = $1
            AND rt.role_id IN (SELECT role_id FROM user_roles WHERE user_id = $2)
            AND t.is_active = 1
          ORDER BY gt.position_index ASC, t.name ASC`,
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
    steps: stepsRes.rows.map((row) => ({
      key: row.key,
      name: row.name,
      sortOrder: Number(row.sort_order || 0),
      isInitial: toFlag(row.is_initial),
      isFinal: toFlag(row.is_final),
      isActive: toFlag(row.is_active),
    })),
    transitions: transitionsRes.rows.map((row) => ({
      key: row.key,
      name: row.name,
      fromStepKey: row.from_step_key,
      toStepKey: row.to_step_key,
      isActive: toFlag(row.is_active),
    })),
  };
}

export async function getAllowedTransition({ moduleKey, userId, transitionKey, fromStepKey }, db = { query }) {
  const group = await getDefaultApprovalGroup(moduleKey, db);
  if (!group) return null;
  const isAdmin = await isAdminUser(userId, db);
  const useUserMappings = await hasUserTransitionMapping(group.key, userId, db);

  const result = isAdmin
    ? await db.query(
        `SELECT t.*
           FROM approval_hierarchy_group_transitions gt
           JOIN approval_hierarchy_transitions t ON t.key = gt.transition_key
          WHERE gt.group_key = $1
            AND t.key = $2
            AND t.from_step_key = $3
            AND t.is_active = 1
          LIMIT 1`,
        [group.key, transitionKey, fromStepKey],
      )
    : useUserMappings
    ? await db.query(
        `SELECT t.*
           FROM approval_hierarchy_group_transitions gt
           JOIN approval_hierarchy_transitions t ON t.key = gt.transition_key
           JOIN approval_hierarchy_user_transitions ut
             ON ut.group_key = gt.group_key
            AND ut.transition_key = gt.transition_key
          WHERE gt.group_key = $1
            AND ut.user_id = $4
            AND t.key = $2
            AND t.from_step_key = $3
            AND t.is_active = 1
          LIMIT 1`,
        [group.key, transitionKey, fromStepKey, userId],
      )
    : await db.query(
        `SELECT DISTINCT t.*
           FROM approval_hierarchy_group_transitions gt
           JOIN approval_hierarchy_transitions t ON t.key = gt.transition_key
           JOIN approval_hierarchy_role_transitions rt
             ON rt.group_key = gt.group_key
            AND rt.transition_key = gt.transition_key
          WHERE gt.group_key = $1
            AND rt.role_id IN (SELECT role_id FROM user_roles WHERE user_id = $4)
            AND t.key = $2
            AND t.from_step_key = $3
            AND t.is_active = 1
          LIMIT 1`,
        [group.key, transitionKey, fromStepKey, userId],
      );

  return result.rows[0] || null;
}

export async function getUserWorkflowAccess({ moduleKey, userId }, db = { query }) {
  return listUserGroupTransitions({ moduleKey, userId }, db);
}
