export function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remain = safe % 60;
  return `${minutes}:${String(remain).padStart(2, "0")}`;
}
