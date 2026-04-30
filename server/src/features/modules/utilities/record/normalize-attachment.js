import { createHttpError } from "./error.js";
import { requiredString } from "./parsers.js";

export function normalizeAttachmentInput(input, maxPdfBytes) {
  const fileName = requiredString(input, "fileName", "fileName");
  const mimeType = requiredString(input, "mimeType", "mimeType").toLowerCase();
  const dataBase64 = requiredString(input, "dataBase64", "dataBase64").replace(/^data:application\/pdf;base64,/i, "");

  if (mimeType !== "application/pdf") throw createHttpError(400, "Only PDF files are allowed.");
  if (!/\.pdf$/i.test(fileName)) throw createHttpError(400, "File name must end with .pdf.");

  const buffer = Buffer.from(dataBase64, "base64");
  if (!buffer.length) throw createHttpError(400, "Attachment content is required.");
  if (buffer.length > maxPdfBytes) throw createHttpError(400, "PDF file is too large. Maximum size is 10 MB.");
  if (buffer.subarray(0, 4).toString("utf8") !== "%PDF") throw createHttpError(400, "Uploaded file is not a valid PDF.");

  return { fileName, mimeType, buffer };
}
