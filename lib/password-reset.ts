import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Email delivery is intentionally separate: this service only creates/consumes opaque reset tokens. */
export async function createPasswordReset(email: string) {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;
  const token = randomBytes(32).toString("base64url");
  await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await db.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
  return token;
}

export async function consumePasswordReset(token: string, password: string) {
  const record = await db.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.expiresAt < new Date()) throw new Error("This password reset link is invalid or has expired.");
  await db.$transaction([db.user.update({ where: { id: record.userId }, data: { passwordHash: await bcrypt.hash(password, 12) } }), db.passwordResetToken.delete({ where: { id: record.id } })]);
}
