import type { UtilityUsageStatus } from "@/features/operations/utilities/config/baseline-settings";

export function statusTone(status?: UtilityUsageStatus) {
  if (status === "alert") return "critical";
  if (status === "high") return "warning";
  if (status === "watch") return "info";
  return "compliant";
}
