import { ensureCoreSchema } from "../../shared/schema.js";

let readyPromise;

export function ensureUtilitiesReady() {
  if (!readyPromise) {
    readyPromise = ensureCoreSchema();
  }

  return readyPromise;
}
