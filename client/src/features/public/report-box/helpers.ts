import { facilities, getFacilityName } from "@/core/data/catalog/mock";

export function formatClock(seconds: number) {
  const value = Math.max(0, Math.floor(seconds));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

export function formatReportNumber(reportId: string | null) {
  const yy = String(new Date().getFullYear() % 100).padStart(2, "0");
  if (!reportId) return `${yy}/---`;
  const digits = reportId.replace(/\D/g, "");
  return `${yy}/${(digits.slice(-3) || "0").padStart(3, "0")}`;
}

export function getCompanyIdFromCode(code?: string | null) {
  if (!code) return undefined;
  const normalized = String(code).trim().toLowerCase();
  return facilities.find((facility) => facility.code.toLowerCase() === normalized)?.id;
}

export function getCompanyBnName(companyId?: string | null) {
  const code = facilities.find((facility) => facility.id === companyId)?.code?.toLowerCase();
  const labels: Record<string, string> = { hfl: "à¦à¦‡à¦šà¦à¦«à¦à¦² (à¦¹à§à¦¯à¦¾à¦¬à¦¿à¦Ÿà¦¾à¦¸ à¦«à§à¦¯à¦¾à¦¶à¦¨ à¦²à¦¿à¦®à¦¿à¦Ÿà§‡à¦¡)", qfl: "à¦•à¦¿à¦‰à¦à¦«à¦à¦²", fgl: "à¦à¦«à¦œà¦¿à¦à¦²", afl: "à¦à¦à¦«à¦à¦²", kadl: "à¦•à§‡à¦à¦¡à¦¿à¦à¦²", rsbl: "à¦†à¦°à¦à¦¸à¦¬à¦¿à¦à¦²", sarah: "à¦¸à¦¾à¦°à¦¾à¦¹ à¦°à¦¿à¦¸à§‹à¦°à§à¦Ÿ", dtr: "à¦¡à¦¾à¦‰à¦¨à¦Ÿà¦¾à¦‰à¦¨ à¦°à¦¿à¦¸à§‹à¦°à§à¦Ÿ" };
  return code && labels[code] ? labels[code] : companyId ? getFacilityName(companyId) : "à¦²à¦¿à¦‚à¦•à¦Ÿà¦¿ à¦¸à¦ à¦¿à¦• à¦¨à§Ÿ";
}

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("à¦«à¦¾à¦‡à¦² à¦ªà§œà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(blob);
  });
}
