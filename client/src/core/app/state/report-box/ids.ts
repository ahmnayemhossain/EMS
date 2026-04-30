export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  const rand = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now().toString(16)}_${rand}`;
}

