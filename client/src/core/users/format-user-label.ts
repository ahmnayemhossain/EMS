export function formatUserLabel(user?: { name?: string | null; employeeId?: string | number | null }) {
  const name = String(user?.name || "").trim();
  const employeeId = String(user?.employeeId || "").trim();

  if (name && employeeId) return `${name} (${employeeId})`;
  if (name) return name;
  if (employeeId) return employeeId;
  return "User";
}
