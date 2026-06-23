import type { CompanyOption } from "@/core/app/state/slices/company";
import { findCompanyByCode, getCompanyPublicLabel } from "@/core/companies/directory";

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

export function getCompanyIdFromCode(code?: string | null, companies?: CompanyOption[]) {
  return findCompanyByCode(code, companies)?.id;
}

export function getCompanyBnName(companyId?: string | null, companies?: CompanyOption[]) {
  return getCompanyPublicLabel(companyId, companies);
}

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(blob);
  });
}
