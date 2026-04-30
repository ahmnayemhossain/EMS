import * as React from "react";

import { documents, getFacilityName } from "@/core/data/mock";

export function useDocumentsPage() {
  const [search, setSearch] = React.useState("");
  const [facilityId, setFacilityId] = React.useState<string | undefined>();
  const rows = documents.filter((item) => facilityId ? item.facilityId === facilityId : true).filter((item) => {
    const query = search.trim().toLowerCase();
    return !query || item.title.toLowerCase().includes(query) || item.category.toLowerCase().includes(query) || item.ownerDepartment.toLowerCase().includes(query) || getFacilityName(item.facilityId).toLowerCase().includes(query);
  });
  return { search, setSearch, facilityId, setFacilityId, rows };
}
