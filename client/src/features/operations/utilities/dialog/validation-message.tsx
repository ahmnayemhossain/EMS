import * as React from "react";

const datePattern = /(\d{4}-\d{2}-\d{2})/g;
const dateCheckPattern = /\d{4}-\d{2}-\d{2}/;
const exactDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const allowedMarker = "You can add only within:";

export function renderUtilityValidationMessage(message: string) {
  if (!dateCheckPattern.test(message)) {
    return message;
  }

  return (
    <span>
      {renderSegment(message, "blocked")}
    </span>
  );
}

function renderSegment(message: string, tone: "blocked" | "allowed") {
  const markerIndex = message.indexOf(allowedMarker);
  if (markerIndex >= 0) {
    const blockedText = message.slice(0, markerIndex);
    const allowedText = message.slice(markerIndex);
    return (
      <>
        {renderDateTokens(blockedText, "blocked")}
        {renderDateTokens(allowedText, "allowed")}
      </>
    );
  }

  return renderDateTokens(message, tone);
}

function renderDateTokens(message: string, tone: "blocked" | "allowed") {
  const parts = message.split(datePattern);
  return parts.map((part, index) =>
    exactDatePattern.test(part) ? (
      <span
        key={`${tone}-${part}-${index}`}
        className={tone === "allowed" ? allowedDateClassName : blockedDateClassName}
      >
        {part}
      </span>
    ) : (
      <React.Fragment key={`${tone}-text-${index}`}>{part}</React.Fragment>
    ),
  );
}

const blockedDateClassName =
  "mx-0.5 inline-flex rounded-md bg-rose-500/12 px-1.5 py-0.5 font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";

const allowedDateClassName =
  "mx-0.5 inline-flex rounded-md bg-emerald-500/12 px-1.5 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
