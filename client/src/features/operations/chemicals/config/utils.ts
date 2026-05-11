export function daysUntil(dateIso?: string) {
  if (!dateIso) return undefined;
  const now = Date.now();
  const d = new Date(dateIso).getTime();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}
