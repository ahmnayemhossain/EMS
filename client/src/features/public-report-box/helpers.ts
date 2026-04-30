import { facilities, getFacilityName } from "@/core/data/mock";

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
  const labels: Record<string, string> = { hfl: "এইচএফএল (হ্যাবিটাস ফ্যাশন লিমিটেড)", qfl: "কিউএফএল", fgl: "এফজিএল", afl: "এএফএল", kadl: "কেএডিএল", rsbl: "আরএসবিএল", sarah: "সারাহ রিসোর্ট", dtr: "ডাউনটাউন রিসোর্ট" };
  return code && labels[code] ? labels[code] : companyId ? getFacilityName(companyId) : "লিংকটি সঠিক নয়";
}

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("ফাইল পড়া যায়নি"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(blob);
  });
}
