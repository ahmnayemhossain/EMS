import type { SettingsEntity } from "@/features/admin/settings/modules/services/settingsEntityApi";
import {
  createSettingsEntity,
  deleteSettingsEntity,
  listSettingsEntities,
  updateSettingsEntity,
} from "@/features/admin/settings/modules/services/settingsEntityApi";
import {
  createSourceWiring,
  createUomWiring,
  deleteSourceWiring,
  deleteUomWiring,
  listSourceWiring,
  listSourceWiringLookups,
  listUomWiring,
  listUomWiringLookups,
  updateSourceWiring,
  updateUomWiring,
} from "@/features/admin/settings/modules/services/uomSettingsApi";
import { MasterWiringModule } from "@/features/admin/settings/modules/master-wiring/module";
import type { MasterWiringApi, MasterWiringConfig } from "@/features/admin/settings/modules/master-wiring/types";

type MasterWiringModuleOptions = {
  config: MasterWiringConfig;
  api: MasterWiringApi;
};

export function renderMasterWiringModule(options: MasterWiringModuleOptions) {
  return <MasterWiringModule config={options.config} api={options.api} />;
}

export function buildUomMasterWiringOptions(): MasterWiringModuleOptions {
  return {
    config: {
      kind: "uom",
      singularLabel: "UOM",
      pluralLabel: "UOM",
      relationLabel: "UOM",
      relationPlaceholder: "Select UOM",
      createSuccess: "UOM created",
      updateSuccess: "UOM updated",
      deleteSuccess: "UOM deleted",
      createWiringSuccess: "UOM wiring created",
      updateWiringSuccess: "UOM wiring updated",
      deleteWiringSuccess: "UOM wiring deleted",
    },
    api: {
      listEntities: (userId) => listSettingsEntities("uom", userId),
      createEntity: (item, userId) => createSettingsEntity("uom", item, userId),
      updateEntity: (item, userId) => updateSettingsEntity("uom", item, userId),
      deleteEntity: (id, userId) => deleteSettingsEntity("uom", id, userId),
      listWiring: async (userId) =>
        (await listUomWiring(userId)).map((row) => ({
          ...row,
          relationId: row.uomId,
          relationName: row.uomName,
        })),
      listLookups: async (userId) => {
        const data = await listUomWiringLookups(userId);
        return {
          relationOptions: data.uomOptions as SettingsEntity[],
          utilityTypeOptions: data.utilityTypeOptions,
        };
      },
      createWiring: async (item, userId) => {
        const row = await createUomWiring(
          {
            uomId: item.relationId,
            utilityTypeId: item.utilityTypeId,
            status: item.status,
          },
          userId,
        );
        return {
          ...row,
          relationId: row.uomId,
          relationName: row.uomName,
        };
      },
      updateWiring: async (item, userId) => {
        const row = await updateUomWiring(
          {
            id: item.id,
            uomId: item.relationId,
            utilityTypeId: item.utilityTypeId,
            status: item.status,
          },
          userId,
        );
        return {
          ...row,
          relationId: row.uomId,
          relationName: row.uomName,
        };
      },
      deleteWiring: deleteUomWiring,
    },
  };
}

export function buildSourceMasterWiringOptions(): MasterWiringModuleOptions {
  return {
    config: {
      kind: "sources",
      singularLabel: "Source",
      pluralLabel: "Sources",
      relationLabel: "Source",
      relationPlaceholder: "Select source",
      createSuccess: "Source created",
      updateSuccess: "Source updated",
      deleteSuccess: "Source deleted",
      createWiringSuccess: "Source wiring created",
      updateWiringSuccess: "Source wiring updated",
      deleteWiringSuccess: "Source wiring deleted",
    },
    api: {
      listEntities: (userId) => listSettingsEntities("sources", userId),
      createEntity: (item, userId) => createSettingsEntity("sources", item, userId),
      updateEntity: (item, userId) => updateSettingsEntity("sources", item, userId),
      deleteEntity: (id, userId) => deleteSettingsEntity("sources", id, userId),
      listWiring: async (userId) =>
        (await listSourceWiring(userId)).map((row) => ({
          ...row,
          relationId: row.sourceId,
          relationName: row.sourceName,
        })),
      listLookups: async (userId) => {
        const data = await listSourceWiringLookups(userId);
        return {
          relationOptions: data.sourceOptions as SettingsEntity[],
          utilityTypeOptions: data.utilityTypeOptions,
        };
      },
      createWiring: async (item, userId) => {
        const row = await createSourceWiring(
          {
            sourceId: item.relationId,
            utilityTypeId: item.utilityTypeId,
            status: item.status,
          },
          userId,
        );
        return {
          ...row,
          relationId: row.sourceId,
          relationName: row.sourceName,
        };
      },
      updateWiring: async (item, userId) => {
        const row = await updateSourceWiring(
          {
            id: item.id,
            sourceId: item.relationId,
            utilityTypeId: item.utilityTypeId,
            status: item.status,
          },
          userId,
        );
        return {
          ...row,
          relationId: row.sourceId,
          relationName: row.sourceName,
        };
      },
      deleteWiring: deleteSourceWiring,
    },
  };
}
