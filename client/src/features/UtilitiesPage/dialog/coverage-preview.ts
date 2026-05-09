import type { UtilityDialogFormState } from "@/features/UtilitiesPage/dialog/form-state";
import type { UtilityRecord } from "@/core/types/ems";

function toDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function toDateString(value: Date) {
  return value.toISOString().slice(0, 10);
}

function addDays(value: string, days: number) {
  const date = toDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toDateString(date);
}

function getMeterKey(state: UtilityDialogFormState) {
  if (state.meterId) return `meter:${state.meterId}`;
  return "";
}

function matchesMeter(row: UtilityRecord, state: UtilityDialogFormState) {
  if (state.meterId && row.meterId) return String(row.meterId) === state.meterId;
  const left = String(row.meterName || "").trim().toLowerCase();
  const right = String(state.meterName || "").trim().toLowerCase();
  return Boolean(left && right && left === right);
}

function getMonthBounds(periodStart: string) {
  const start = toDate(`${periodStart.slice(0, 7)}-01`);
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0));
  return { monthStart: toDateString(start), monthEnd: toDateString(end) };
}

function buildMissingRanges(rows: Array<{ start: string; end: string }>, monthStart: string, monthEnd: string) {
  const missingRanges: Array<{ start: string; end: string }> = [];
  let cursor = monthStart;

  for (const row of rows) {
    if (row.start > cursor) {
      missingRanges.push({ start: cursor, end: addDays(row.start, -1) });
    }
    const nextCursor = addDays(row.end, 1);
    if (nextCursor > cursor) cursor = nextCursor;
  }

  if (cursor <= monthEnd) {
    missingRanges.push({ start: cursor, end: monthEnd });
  }

  return missingRanges;
}

function formatRanges(ranges: Array<{ start: string; end: string }>) {
  return ranges
    .map((row) => (row.start === row.end ? row.start : `${row.start} to ${row.end}`))
    .join(", ");
}

export function getCoveragePreview(input: {
  state: UtilityDialogFormState;
  existingRecords: UtilityRecord[];
  excludeRecordId?: number;
}) {
  const { periodStart, periodEnd } = input.state;
  if (!periodStart || !periodEnd) return { error: "", warning: "" };
  if (periodStart.slice(0, 7) !== periodEnd.slice(0, 7)) {
    return { error: "One utility entry cannot span more than one month.", warning: "" };
  }

  const meterKey = getMeterKey(input.state);
  if (!meterKey) return { error: "", warning: "" };

  const relevant = input.existingRecords
    .filter(
      (row) =>
        row.id !== input.excludeRecordId &&
        row.facilityId === input.state.companyId &&
        row.type === input.state.type &&
        (row.meterKey === meterKey || matchesMeter(row, input.state)) &&
        row.periodMonth === `${periodStart.slice(0, 7)}-01`,
    )
    .map((row) => ({ start: row.periodStart, end: row.periodEnd }))
    .sort((a, b) => a.start.localeCompare(b.start));

  const { monthStart, monthEnd } = getMonthBounds(periodStart);

  const overlap = relevant.find((row) => row.start <= periodEnd && row.end >= periodStart);
  if (overlap) {
    const allowedRanges = buildMissingRanges(relevant, monthStart, monthEnd);
    const suggestion = allowedRanges.length
      ? ` You can add only within: ${formatRanges(allowedRanges)}.`
      : " This month is already fully covered.";
    return {
      error: `Date overlap with existing entry (${overlap.start} to ${overlap.end}).${suggestion}`,
      warning: "",
    };
  }

  const rows = [...relevant, { start: periodStart, end: periodEnd }].sort((a, b) => a.start.localeCompare(b.start));
  const missingRanges = buildMissingRanges(rows, monthStart, monthEnd);

  if (!missingRanges.length) return { error: "", warning: "" };
  const label = formatRanges(missingRanges);
  return {
    error: "",
    warning: `Month coverage has missing day(s): ${label}. Approval will stay pending until the full month is covered.`,
  };
}
