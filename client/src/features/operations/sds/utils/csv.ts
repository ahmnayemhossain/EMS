import { SDS_SECTION_DEFS } from "../config/constants";

type SdsCsvRecord = {
  chemicalName: string;
  supplier: string;
  language: string;
  revisionDate: string;
  notes?: string;
  sections: Array<{ id: string; title: string; summary: string }>;
};

export type SdsCsvValidationIssue = {
  rowLabel: string;
  field: string;
  message: string;
  suggestion?: string;
};

const BASE_COLUMNS = ["chemicalName", "supplier", "language", "revisionDate", "notes"] as const;
const SECTION_COLUMNS = SDS_SECTION_DEFS.map((item) => `section_${item.id}` as const);

export const SDS_CSV_COLUMNS = [...BASE_COLUMNS, ...SECTION_COLUMNS];

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsvText(csvText: string) {
  const normalized = csvText.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if (char === "\n" && !quoted) {
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some((value) => value.length > 0)) rows.push(row);

  if (!rows.length) {
    throw new Error("CSV file is empty.");
  }

  return { header: rows[0], rows: rows.slice(1) };
}

function getColumnIndexMap(header: string[]) {
  return Object.fromEntries(header.map((name, index) => [name.trim(), index])) as Record<string, number>;
}

function normalizeRevisionDate(value: string, rowNumber: number) {
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return value;

  const usMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  throw new Error(`Row ${rowNumber}: revisionDate must be m/d/yyyy.`);
}

export function buildSdsTemplateCsv() {
  const noteRow = [
    "# Use revisionDate as m/d/yyyy",
    "",
    "",
    "example: 6/2/2026",
    ...SDS_SECTION_DEFS.map(() => ""),
  ];
  return `${SDS_CSV_COLUMNS.map(escapeCsvCell).join(",")}\n${noteRow.map(escapeCsvCell).join(",")}\n`;
}

export function validateSdsCsv(csvText: string): { records: SdsCsvRecord[]; issues: SdsCsvValidationIssue[] } {
  const issues: SdsCsvValidationIssue[] = [];
  let header: string[] = [];
  let rows: string[][] = [];

  try {
    const parsed = parseCsvText(csvText);
    header = parsed.header;
    rows = parsed.rows;
  } catch (error) {
    return {
      records: [],
      issues: [
        {
          rowLabel: "File",
          field: "CSV",
          message: error instanceof Error ? error.message : "CSV file could not be read.",
          suggestion: "Download the template and upload a valid CSV file.",
        },
      ],
    };
  }

  const indexByName = getColumnIndexMap(header);
  const missingColumns = SDS_CSV_COLUMNS.filter((column) => typeof indexByName[column] !== "number");

  for (const column of missingColumns) {
    issues.push({
      rowLabel: "Header",
      field: column,
      message: "Required column is missing.",
      suggestion: "Download the latest template and keep the header unchanged.",
    });
  }

  const dataRows = rows
    .map((row, index) => ({ row, rowNumber: index + 2 }))
    .filter((item) => !String(item.row[0] ?? "").trim().startsWith("#"));

  if (!dataRows.length) {
    issues.push({
      rowLabel: "File",
      field: "Rows",
      message: "CSV file has no data rows.",
      suggestion: "Add at least one SDS row below the header.",
    });
    return { records: [], issues };
  }

  if (issues.length) {
    return { records: [], issues };
  }

  const records: SdsCsvRecord[] = [];

  for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex += 1) {
    const { row, rowNumber } = dataRows[rowIndex];
    const rowLabel = `Row ${rowNumber}`;
    const getValue = (column: string) => String(row[indexByName[column]] ?? "").trim();

    const chemicalName = getValue("chemicalName");
    const supplier = getValue("supplier");
    const language = getValue("language");
    const revisionDateRaw = getValue("revisionDate");
    const notes = getValue("notes");

    if (!chemicalName) {
      issues.push({
        rowLabel,
        field: "chemicalName",
        message: "Chemical name is required.",
        suggestion: "Enter the chemical name from the SDS title.",
      });
    }
    if (!supplier) {
      issues.push({
        rowLabel,
        field: "supplier",
        message: "Supplier is required.",
        suggestion: "Enter the manufacturer or supplier name.",
      });
    }
    if (!language) {
      issues.push({
        rowLabel,
        field: "language",
        message: "Language is required.",
        suggestion: "Use English or Bangla.",
      });
    }
    if (!revisionDateRaw) {
      issues.push({
        rowLabel,
        field: "revisionDate",
        message: "Revision date is required.",
        suggestion: "Use US date format like 6/2/2026.",
      });
    }

    const sections = SDS_SECTION_DEFS.map((section) => {
      const summary = getValue(`section_${section.id}`);
      if (!summary) {
        issues.push({
          rowLabel,
          field: `section_${section.id}`,
          message: `Section ${section.id} summary is required.`,
          suggestion: `Add a short summary for ${section.title}.`,
        });
      }
      return {
        id: section.id,
        title: section.title,
        summary,
      };
    });

    let revisionDate = revisionDateRaw;
    if (revisionDateRaw) {
      try {
        revisionDate = normalizeRevisionDate(revisionDateRaw, rowNumber);
      } catch {
        issues.push({
          rowLabel,
          field: "revisionDate",
          message: "Revision date must be m/d/yyyy.",
          suggestion: "Example: 6/2/2026",
        });
      }
    }

    records.push({
      chemicalName,
      supplier,
      language,
      revisionDate,
      notes: notes || undefined,
      sections,
    });
  }

  if (issues.length) {
    return { records: [], issues };
  }

  return { records, issues: [] };
}
