import { Role } from "@prisma/client";
import { get } from "@vercel/blob";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole([Role.ADMIN, Role.EDITOR]);
  const { id } = await params;
  const attachment = await db.enquiryAttachment.findUnique({ where: { id } });
  if (!attachment) return new Response("Not found", { status: 404 });
  try {
    const result = await get(attachment.url, { access: "private", token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!result || result.statusCode !== 200 || !result.stream) return new Response("Not found", { status: 404 });
    return new Response(result.stream, { headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="attachment"; filename*=UTF-8''${encodeURIComponent(attachment.filename).replace(/['()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return new Response("Attachment unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
