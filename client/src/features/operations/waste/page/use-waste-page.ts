import * as React from "react";

import { facilities, getFacilityName, wasteRecords } from "@/core/data/catalog/mock";
import { formatDate, formatNumber } from "@/core/utils/format";
import type { TimelineItem } from "@/components/layout/primitives/TimelineList";

export function useWastePage() {
  const [tab, setTab] = React.useState("generation");
  const [search, setSearch] = React.useState("");
  const [facilityId, setFacilityId] = React.useState<string | undefined>();
  const rows = wasteRecords.filter((item) => facilityId ? item.facilityId === facilityId : true).filter((item) => { const q = search.trim().toLowerCase(); return !q || item.stream.toLowerCase().includes(q) || item.storageLocation.toLowerCase().includes(q) || (item.vendor ?? "").toLowerCase().includes(q) || getFacilityName(item.facilityId).toLowerCase().includes(q); });
  const disposalTimeline: TimelineItem[] = rows.filter((item) => item.disposalStatus !== "disposed").map((item) => ({ id: item.id, title: `${item.stream} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ${formatNumber(item.qtyKg)} kg`, date: item.dueBy ? `Due ${formatDate(item.dueBy)}` : `Logged ${formatDate(item.date)}`, description: `${getFacilityName(item.facilityId)} ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ${item.vendor ?? "Vendor not assigned"}`, tone: item.type === "hazardous" ? "warning" : "info" }));
  return { tab, setTab, search, setSearch, facilityId, setFacilityId, rows, facilities, hazardousBacklog: rows.filter((item) => item.type === "hazardous" && item.disposalStatus !== "disposed").length, dueSoon: rows.filter((item) => item.dueBy && new Date(item.dueBy).getTime() <= new Date("2026-04-15").getTime()).length, totalKgLabel: `${formatNumber(rows.reduce((sum, item) => sum + item.qtyKg, 0))} kg`, disposalTimeline };
}

