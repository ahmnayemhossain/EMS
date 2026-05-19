import { query } from "./postgres.js";

function toFlag(value) {
  return Number(value) === 1;
}

function toGroupMap(groups, transitions) {
  const byGroup = new Map(groups.map((group) => [group.key, { ...group, transitionKeys: [] }]));
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

export async function listApprovalHierarchyConfig(db = { query }) {
  const [stepsRes, transitionsRes, groupsRes, groupTransitionsRes, roleTransitionsRes, rolesRes] = await Promise.all([
    db.query(`SELECT * FROM approval_hierarchy_steps ORDER BY sort_order ASC, name ASC`),
    db.query(`SELECT * FROM approval_hierarchy_transitions ORDER BY name ASC`),
    db.query(`SELECT * FROM approval_hierarchy_groups ORDER BY module_key ASC, name ASC`),
    db.query(`SELECT * FROM approval_hierarchy_group_transitions ORDER BY group_key ASC, position_index ASC, transition_key ASC`),
    db.query(`SELECT * FROM approval_hierarchy_role_transitions ORDER BY group_key ASC, role_id ASC, transition_key ASC`),
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
    groups: toGroupMap(groupsRes.rows, groupTransitionsRes.rows),
    roleMappings: toRoleMappings(roleTransitionsRes.rows),
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

  const [stepsRes, transitionsRes] = await Promise.all([
    db.query(
      `SELECT DISTINCT s.*
         FROM approval_hierarchy_steps s
         JOIN approval_hierarchy_transitions t ON t.from_step_key = s.key OR t.to_step_key = s.key
         JOIN approval_hierarchy_role_transitions rt ON rt.transition_key = t.key
        WHERE rt.group_key = $1 AND rt.role_id IN (SELECT role_id FROM user_roles WHERE user_id = $2)
          AND s.is_active = 1
        ORDER BY s.sort_order ASC, s.name ASC`,
      [group.key, userId],
    ),
    db.query(
      `SELECT DISTINCT t.*
         FROM approval_hierarchy_transitions t
         JOIN approval_hierarchy_role_transitions rt ON rt.transition_key = t.key
        WHERE rt.group_key = $1
          AND rt.role_id IN (SELECT role_id FROM user_roles WHERE user_id = $2)
          AND t.is_active = 1
        ORDER BY t.name ASC`,
      [group.key, userId],
    ),
  ]);

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

  const result = await db.query(
    `SELECT DISTINCT t.*
       FROM approval_hierarchy_transitions t
       JOIN approval_hierarchy_role_transitions rt
         ON rt.group_key = $1
        AND rt.transition_key = t.key
      WHERE t.key = $2
        AND t.from_step_key = $3
        AND t.is_active = 1
        AND rt.role_id IN (SELECT role_id FROM user_roles WHERE user_id = $4)
      LIMIT 1`,
    [group.key, transitionKey, fromStepKey, userId],
  );

  return result.rows[0] || null;
}
