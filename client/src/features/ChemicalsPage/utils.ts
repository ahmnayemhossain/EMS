export function daysUntil(dateIso?: string) {
  if (!dateIso) return undefined;
  const now = new Date("2026-04-09T00:00:00+06:00").getTime();
  const d = new Date(dateIso).getTime();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

