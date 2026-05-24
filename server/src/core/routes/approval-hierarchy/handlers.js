import { getRequestActor } from "../../shared/audit-log.js";
import { listApprovalHierarchyConfig } from "../../shared/approval-hierarchy.js";
import { pool } from "../../shared/postgres.js";
import { ensureCoreSchema } from "../../shared/schema.js";

function normalizeStep(input) {
  return {
    key: String(input?.key || "").trim().toLowerCase(),
    name: String(input?.name || "").trim(),
    sortOrder: Number(input?.sortOrder || 0),
    isInitial: Number(input?.isInitial ? 1 : 0),
    isFinal: Number(input?.isFinal ? 1 : 0),
    isActive: Number(input?.isActive ?? true ? 1 : 0),
  };
}

function normalizeTransition(input) {
  return {
    key: String(input?.key || "").trim().toLowerCase(),
    name: String(input?.name || "").trim(),
    fromStepKey: String(input?.fromStepKey || "").trim().toLowerCase(),
    toStepKey: String(input?.toStepKey || "").trim().toLowerCase(),
    isActive: Number(input?.isActive ?? true ? 1 : 0),
  };
}

function normalizeGroup(input) {
  return {
    key: String(input?.key || "").trim().toLowerCase(),
    name: String(input?.name || "").trim(),
    moduleKey: String(input?.moduleKey || "").trim().toLowerCase(),
    description: String(input?.description || "").trim(),
    isDefault: Number(input?.isDefault ? 1 : 0),
    isActive: Number(input?.isActive ?? true ? 1 : 0),
    stepKeys: Array.isArray(input?.stepKeys)
      ? input.stepKeys.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean)
      : [],
    transitionKeys: Array.isArray(input?.transitionKeys)
      ? input.transitionKeys.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean)
      : [],
  };
}

function normalizeRoleMapping(input) {
  return {
    groupKey: String(input?.groupKey || "").trim().toLowerCase(),
    roleId: Number(input?.roleId || 0),
    transitionKeys: Array.isArray(input?.transitionKeys)
      ? input.transitionKeys.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean)
      : [],
  };
}

function normalizeUserMapping(input) {
  return {
    groupKey: String(input?.groupKey || "").trim().toLowerCase(),
    userId: Number(input?.userId || 0),
    transitionKeys: Array.isArray(input?.transitionKeys)
      ? input.transitionKeys.map((item) => String(item || "").trim().toLowerCase()).filter(Boolean)
      : [],
  };
}

function assertValidPayload(payload) {
  const steps = Array.isArray(payload?.steps) ? payload.steps.map(normalizeStep) : [];
  const transitions = Array.isArray(payload?.transitions) ? payload.transitions.map(normalizeTransition) : [];
  const groups = Array.isArray(payload?.groups) ? payload.groups.map(normalizeGroup) : [];
  const roleMappings = Array.isArray(payload?.roleMappings) ? payload.roleMappings.map(normalizeRoleMapping) : [];
  const userMappings = Array.isArray(payload?.userMappings) ? payload.userMappings.map(normalizeUserMapping) : [];

  const stepKeys = new Set();
  for (const step of steps) {
    if (!step.key || !step.name) throw new Error("Each hierarchy step needs key and name.");
    if (stepKeys.has(step.key)) throw new Error(`Duplicate step key: ${step.key}`);
    stepKeys.add(step.key);
  }

  const transitionKeys = new Set();
  for (const transition of transitions) {
    if (!transition.key || !transition.name || !transition.fromStepKey || !transition.toStepKey) {
      throw new Error("Each hierarchy transition needs key, name, from step, and to step.");
    }
    if (!stepKeys.has(transition.fromStepKey) || !stepKeys.has(transition.toStepKey)) {
      throw new Error(`Transition ${transition.key} points to a missing step.`);
    }
    if (transitionKeys.has(transition.key)) throw new Error(`Duplicate transition key: ${transition.key}`);
    transitionKeys.add(transition.key);
  }

  const groupKeys = new Set();
  for (const group of groups) {
    if (!group.key || !group.name || !group.moduleKey) throw new Error("Each hierarchy group needs key, name, and module.");
    if (groupKeys.has(group.key)) throw new Error(`Duplicate group key: ${group.key}`);
    groupKeys.add(group.key);
    for (const stepKey of group.stepKeys) {
      if (!stepKeys.has(stepKey)) throw new Error(`Group ${group.key} uses missing step ${stepKey}.`);
    }
    for (const transitionKey of group.transitionKeys) {
      if (!transitionKeys.has(transitionKey)) throw new Error(`Group ${group.key} uses missing transition ${transitionKey}.`);
    }
  }

  for (const mapping of roleMappings) {
    if (!mapping.groupKey || !groupKeys.has(mapping.groupKey)) throw new Error("Role mapping group is missing.");
    if (!Number.isFinite(mapping.roleId) || mapping.roleId <= 0) throw new Error("Role mapping role is invalid.");
    const group = groups.find((item) => item.key === mapping.groupKey);
    for (const transitionKey of mapping.transitionKeys) {
      if (!transitionKeys.has(transitionKey)) throw new Error(`Role mapping uses missing transition ${transitionKey}.`);
      if (!group?.transitionKeys.includes(transitionKey)) {
        throw new Error(`Role mapping transition ${transitionKey} is not part of group ${mapping.groupKey}.`);
      }
    }
  }

  for (const mapping of userMappings) {
    if (!mapping.groupKey || !groupKeys.has(mapping.groupKey)) throw new Error("User mapping group is missing.");
    if (!Number.isFinite(mapping.userId) || mapping.userId <= 0) throw new Error("User mapping user is invalid.");
    const group = groups.find((item) => item.key === mapping.groupKey);
    for (const transitionKey of mapping.transitionKeys) {
      if (!transitionKeys.has(transitionKey)) throw new Error(`User mapping uses missing transition ${transitionKey}.`);
      if (!group?.transitionKeys.includes(transitionKey)) {
        throw new Error(`User mapping transition ${transitionKey} is not part of group ${mapping.groupKey}.`);
      }
    }
  }

  return { steps, transitions, groups, roleMappings, userMappings };
}

export async function getApprovalHierarchyConfig(_req, res, next) {
  try {
    await ensureCoreSchema();
    res.json(await listApprovalHierarchyConfig());
  } catch (error) {
    next(error);
  }
}

export async function replaceApprovalHierarchyConfig(req, res, next) {
  try {
    await ensureCoreSchema();
    const { steps, transitions, groups, roleMappings, userMappings } = assertValidPayload(req.body || {});
    const actor = await getRequestActor(req);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query("DELETE FROM approval_hierarchy_user_transitions");
      await client.query("DELETE FROM approval_hierarchy_role_transitions");
      await client.query("DELETE FROM approval_hierarchy_group_transitions");
      await client.query("DELETE FROM approval_hierarchy_group_steps");
      await client.query("DELETE FROM approval_hierarchy_groups");
      await client.query("DELETE FROM approval_hierarchy_transitions");
      await client.query("DELETE FROM approval_hierarchy_steps");

      for (const step of steps) {
        await client.query(
          `INSERT INTO approval_hierarchy_steps
            (key, name, sort_order, is_initial, is_final, is_active, created_by_user_id, updated_by_user_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
          [step.key, step.name, step.sortOrder, step.isInitial, step.isFinal, step.isActive, actor.id],
        );
      }

      for (const transition of transitions) {
        await client.query(
          `INSERT INTO approval_hierarchy_transitions
            (key, name, from_step_key, to_step_key, is_active, created_by_user_id, updated_by_user_id)
           VALUES ($1, $2, $3, $4, $5, $6, $6)`,
          [transition.key, transition.name, transition.fromStepKey, transition.toStepKey, transition.isActive, actor.id],
        );
      }

      for (const group of groups) {
        await client.query(
          `INSERT INTO approval_hierarchy_groups
            (key, name, module_key, description, is_default, is_active, created_by_user_id, updated_by_user_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
          [group.key, group.name, group.moduleKey, group.description, group.isDefault, group.isActive, actor.id],
        );

        for (let index = 0; index < group.stepKeys.length; index += 1) {
          await client.query(
            `INSERT INTO approval_hierarchy_group_steps (group_key, step_key, position_index)
             VALUES ($1, $2, $3)`,
            [group.key, group.stepKeys[index], index + 1],
          );
        }

        for (let index = 0; index < group.transitionKeys.length; index += 1) {
          await client.query(
            `INSERT INTO approval_hierarchy_group_transitions (group_key, transition_key, position_index)
             VALUES ($1, $2, $3)`,
            [group.key, group.transitionKeys[index], index + 1],
          );
        }
      }

      for (const mapping of roleMappings) {
        for (const transitionKey of mapping.transitionKeys) {
          await client.query(
            `INSERT INTO approval_hierarchy_role_transitions (group_key, role_id, transition_key)
             VALUES ($1, $2, $3)`,
            [mapping.groupKey, mapping.roleId, transitionKey],
          );
        }
      }

      for (const mapping of userMappings) {
        for (const transitionKey of mapping.transitionKeys) {
          await client.query(
            `INSERT INTO approval_hierarchy_user_transitions (group_key, user_id, transition_key)
             VALUES ($1, $2, $3)`,
            [mapping.groupKey, mapping.userId, transitionKey],
          );
        }
      }

      await client.query("COMMIT");
      res.json(await listApprovalHierarchyConfig(client));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
}
