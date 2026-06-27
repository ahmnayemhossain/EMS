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

function buildTransitionKey(fromStepKey, toStepKey) {
  return `${fromStepKey}_to_${toStepKey}`;
}

function buildTransitionName(stepNameByKey, fromStepKey, toStepKey) {
  return `${stepNameByKey.get(fromStepKey) || fromStepKey} to ${stepNameByKey.get(toStepKey) || toStepKey}`;
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
  const requestedTransitions = Array.isArray(payload?.transitions) ? payload.transitions.map(normalizeTransition) : [];
  const groups = Array.isArray(payload?.groups) ? payload.groups.map(normalizeGroup) : [];
  const roleMappings = Array.isArray(payload?.roleMappings) ? payload.roleMappings.map(normalizeRoleMapping) : [];
  const userMappings = Array.isArray(payload?.userMappings) ? payload.userMappings.map(normalizeUserMapping) : [];

  const stepKeys = new Set();
  const stepNameByKey = new Map();
  for (const step of steps) {
    if (!step.key || !step.name) throw new Error("Each hierarchy step needs key and name.");
    if (stepKeys.has(step.key)) throw new Error(`Duplicate step key: ${step.key}`);
    stepKeys.add(step.key);
    stepNameByKey.set(step.key, step.name);
  }

  const requestedTransitionsByKey = new Map();
  for (const transition of requestedTransitions) {
    if (!transition.key || !transition.fromStepKey || !transition.toStepKey) {
      throw new Error("Each hierarchy transition needs key, from step, and to step.");
    }
    if (!stepKeys.has(transition.fromStepKey) || !stepKeys.has(transition.toStepKey)) {
      throw new Error(`Transition ${transition.key} points to a missing step.`);
    }
    if (requestedTransitionsByKey.has(transition.key)) throw new Error(`Duplicate transition key: ${transition.key}`);
    requestedTransitionsByKey.set(transition.key, transition);
  }

  const groupKeys = new Set();
  const derivedGroups = groups.map((group) => {
    if (!group.key || !group.name || !group.moduleKey) throw new Error("Each hierarchy group needs key, name, and module.");
    if (groupKeys.has(group.key)) throw new Error(`Duplicate group key: ${group.key}`);
    groupKeys.add(group.key);
    for (const stepKey of group.stepKeys) {
      if (!stepKeys.has(stepKey)) throw new Error(`Group ${group.key} uses missing step ${stepKey}.`);
    }
    const transitionKeys = [];
    for (let index = 0; index < group.stepKeys.length - 1; index += 1) {
      const fromStepKey = group.stepKeys[index];
      const toStepKey = group.stepKeys[index + 1];
      transitionKeys.push(buildTransitionKey(fromStepKey, toStepKey));
      transitionKeys.push(buildTransitionKey(toStepKey, fromStepKey));
    }
    return {
      ...group,
      transitionKeys,
    };
  });

  const transitionsByKey = new Map();
  for (const group of derivedGroups) {
    for (let index = 0; index < group.stepKeys.length - 1; index += 1) {
      const fromStepKey = group.stepKeys[index];
      const toStepKey = group.stepKeys[index + 1];
      for (const [fromKey, toKey] of [
        [fromStepKey, toStepKey],
        [toStepKey, fromStepKey],
      ]) {
        const key = buildTransitionKey(fromKey, toKey);
        if (transitionsByKey.has(key)) continue;
        const requested = requestedTransitionsByKey.get(key);
        transitionsByKey.set(key, {
          key,
          name: requested?.name || buildTransitionName(stepNameByKey, fromKey, toKey),
          fromStepKey: fromKey,
          toStepKey: toKey,
          isActive: requested?.isActive ?? 1,
        });
      }
    }
  }

  const transitions = Array.from(transitionsByKey.values());
  const transitionKeys = new Set(transitions.map((transition) => transition.key));

  const sanitizedRoleMappings = roleMappings.map((mapping) => {
    const group = derivedGroups.find((item) => item.key === mapping.groupKey);
    const allowedTransitionKeys = new Set(group?.transitionKeys || []);
    return {
      ...mapping,
      transitionKeys: mapping.transitionKeys.filter((transitionKey) => allowedTransitionKeys.has(transitionKey)),
    };
  });

  for (const mapping of sanitizedRoleMappings) {
    if (!mapping.groupKey || !groupKeys.has(mapping.groupKey)) throw new Error("Role mapping group is missing.");
    if (!Number.isFinite(mapping.roleId) || mapping.roleId <= 0) throw new Error("Role mapping role is invalid.");
    for (const transitionKey of mapping.transitionKeys) {
      if (!transitionKeys.has(transitionKey)) throw new Error(`Role mapping uses missing transition ${transitionKey}.`);
    }
  }

  const sanitizedUserMappings = userMappings.map((mapping) => {
    const group = derivedGroups.find((item) => item.key === mapping.groupKey);
    const allowedTransitionKeys = new Set(group?.transitionKeys || []);
    return {
      ...mapping,
      transitionKeys: mapping.transitionKeys.filter((transitionKey) => allowedTransitionKeys.has(transitionKey)),
    };
  });

  for (const mapping of sanitizedUserMappings) {
    if (!mapping.groupKey || !groupKeys.has(mapping.groupKey)) throw new Error("User mapping group is missing.");
    if (!Number.isFinite(mapping.userId) || mapping.userId <= 0) throw new Error("User mapping user is invalid.");
    for (const transitionKey of mapping.transitionKeys) {
      if (!transitionKeys.has(transitionKey)) throw new Error(`User mapping uses missing transition ${transitionKey}.`);
    }
  }

  return {
    steps,
    transitions,
    groups: derivedGroups,
    roleMappings: sanitizedRoleMappings.filter((mapping) => mapping.transitionKeys.length),
    userMappings: sanitizedUserMappings.filter((mapping) => mapping.transitionKeys.length),
  };
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
    await getRequestActor(req);
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query("DELETE FROM workflow_user_assignments");
      await client.query("DELETE FROM workflow_role_assignments");
      await client.query("DELETE FROM workflow_events");
      await client.query("DELETE FROM workflow_instances");
      await client.query("DELETE FROM workflow_transitions");
      await client.query("DELETE FROM workflow_steps");
      await client.query("DELETE FROM workflow_definitions");

      const stepByKey = new Map(steps.map((item) => [item.key, item]));
      const transitionByKey = new Map(transitions.map((item) => [item.key, item]));

      for (const group of groups) {
        await client.query(
          `INSERT INTO workflow_definitions
            (key, name, module_key, description, is_default, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [group.key, group.name, group.moduleKey, group.description, group.isDefault, group.isActive],
        );

        for (let index = 0; index < group.stepKeys.length; index += 1) {
          const step = stepByKey.get(group.stepKeys[index]);
          if (!step) continue;
          await client.query(
            `INSERT INTO workflow_steps
              (workflow_key, key, name, sort_order, is_initial, is_final, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
            [group.key, step.key, step.name, index + 1, step.isInitial, step.isFinal, step.isActive],
          );
        }

        for (let index = 0; index < group.transitionKeys.length; index += 1) {
          const transition = transitionByKey.get(group.transitionKeys[index]);
          if (!transition) continue;
          await client.query(
            `INSERT INTO workflow_transitions
              (workflow_key, key, name, from_step_key, to_step_key, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
            [
              group.key,
              transition.key,
              transition.name,
              transition.fromStepKey,
              transition.toStepKey,
              transition.isActive,
            ],
          );
        }
      }

      for (const mapping of roleMappings) {
        for (const transitionKey of mapping.transitionKeys) {
          await client.query(
            `INSERT INTO workflow_role_assignments (workflow_key, role_id, transition_key)
             VALUES ($1, $2, $3)`,
            [mapping.groupKey, mapping.roleId, transitionKey],
          );
        }
      }

      for (const mapping of userMappings) {
        for (const transitionKey of mapping.transitionKeys) {
          await client.query(
            `INSERT INTO workflow_user_assignments (workflow_key, user_id, transition_key)
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
