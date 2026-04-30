import { ensureCoreSchema } from "../../../core/shared/schema.js";

let readyPromise;

export function ensureUtilitiesReady() {
  if (!readyPromise) {
    readyPromise = ensureCoreSchema();
  }

  return readyPromise;
}
