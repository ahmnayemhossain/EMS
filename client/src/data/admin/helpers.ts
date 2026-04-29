import { facilities } from "@/data/mock";

export function pickCompanyId(i: number) {
  return facilities[i % facilities.length]?.id ?? facilities[0]?.id ?? "fac_hfl";
}

export function isoDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export function isoDateTime(hoursAgo: number) {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}
