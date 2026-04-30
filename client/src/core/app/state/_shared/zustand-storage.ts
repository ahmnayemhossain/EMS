import { createJSONStorage } from "zustand/middleware";

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();

  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

const memoryStorage = createMemoryStorage();

function getSafeStorage(): Storage {
  if (typeof window === "undefined") return memoryStorage;
  try {
    return window.localStorage;
  } catch {
    return memoryStorage;
  }
}

export function createSafeJsonStorage<S>() {
  return createJSONStorage<S>(() => getSafeStorage());
}

