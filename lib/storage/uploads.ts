import { randomUUID } from "node:crypto";
import { MAX_UPLOAD_BYTES, permittedUploadTypes } from "@/lib/validation/enquiry";

export type StoredUpload = { url: string; filename: string; contentType: string; size: number };

export async function validateUpload(file: File) {
  if (!permittedUploadTypes.includes(file.type as typeof permittedUploadTypes[number])) throw new Error("Upload a JPG, PNG, WebP or PDF file.");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Files must be 5 MB or smaller.");
  if (!file.size) throw new Error("The selected file is empty.");
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const starts = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  const valid = (file.type === "image/jpeg" && starts(0xff, 0xd8, 0xff)) ||
    (file.type === "image/png" && starts(0x89, 0x50, 0x4e, 0x47)) ||
    (file.type === "image/webp" && starts(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") ||
    (file.type === "application/pdf" && starts(0x25, 0x50, 0x44, 0x46));
  if (!valid) throw new Error("The file content does not match the selected file type.");
}

/**
 * Storage is deliberately isolated. Vercel Blob is used only when configured;
 * no file is accepted silently when production storage is absent.
 */
export async function storeUpload(file: File, prefix: "enquiries" | "products"): Promise<StoredUpload> {
  await validateUpload(file);
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("File uploads are not configured yet. Please send the enquiry without an attachment or configure BLOB_READ_WRITE_TOKEN.");
  const { put } = await import("@vercel/blob");
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const key = `${prefix}/${randomUUID()}.${extension}`;
  const result = await put(key, file, { access: "private", addRandomSuffix: false, token, contentType: file.type });
  return { url: result.url, filename: file.name.slice(0, 180), contentType: file.type, size: file.size };
}
