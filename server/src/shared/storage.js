import fs from "node:fs/promises";
import path from "node:path";

const STORAGE_ROOT = process.env.STORAGE_ROOT
  ? path.resolve(process.env.STORAGE_ROOT)
  : path.resolve(process.cwd(), "storage");

const CDN_ROOT = path.join(STORAGE_ROOT, "cdn");
const CDN_PUBLIC_BASE = process.env.CDN_PUBLIC_BASE || "/cdn";

export const MAX_PDF_BYTES = 10 * 1024 * 1024;

export function getStorageRoot() {
  return STORAGE_ROOT;
}

export function getCdnRoot() {
  return CDN_ROOT;
}

export function getCdnPublicBase() {
  return CDN_PUBLIC_BASE;
}

export async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

export function sanitizeFilePart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "file";
}

export function resolveCdnPath(relativePath) {
  return path.join(CDN_ROOT, relativePath);
}

export function toCdnUrl(relativePath) {
  return `${CDN_PUBLIC_BASE}/${String(relativePath).replace(/\\/g, "/")}`;
}

export async function removeFileIfExists(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}
