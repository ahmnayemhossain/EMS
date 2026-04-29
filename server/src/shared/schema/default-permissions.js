import { generalPermissions } from "./default-permissions-general.js";
import { settingsPermissions } from "./default-permissions-settings.js";

export const defaultPermissions = [...generalPermissions, ...settingsPermissions];
