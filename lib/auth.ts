import { Role } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";

const COOKIE_NAME = "igp_session";
const SESSION_DURATION = 60 * 60 * 8;
type Session = { userId: string; role: Role; email: string };

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be set to a value of at least 32 characters.");
  return new TextEncoder().encode(value);
}

export async function createSession(session: Session) {
  const token = await new SignJWT({ role: session.role, email: session.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secret());
  const store = await cookies();
  store.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_DURATION });
}

export async function clearSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}

export const getSession = cache(async (): Promise<Session | null> => {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string" || !Object.values(Role).includes(payload.role as Role)) return null;
    return { userId: payload.sub, email: payload.email, role: payload.role as Role };
  } catch { return null; }
});

export async function requireRole(roles: Role[]) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  // A signed cookie may outlive the account or its permissions.
  const user = await db.user.findUnique({ where: { id: session.userId }, select: { id: true, email: true, role: true } });
  if (!user) redirect("/login?next=/admin");
  if (!roles.includes(user.role)) redirect("/login?error=forbidden");
  return { userId: user.id, email: user.email, role: user.role };
}

export async function assertSameOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const configured = process.env.APP_URL?.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production" && !configured) throw new Error("APP_URL must be configured in production.");
  if (origin && configured && origin !== configured) throw new Error("The request origin was not accepted.");
}

async function enforceRateLimit(key: string, windowMs: number, limit: number) {
  await db.$transaction(async (tx) => {
    // Serialize checks for the same key across application instances.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
    const count = await tx.loginAttempt.count({ where: { key, createdAt: { gte: new Date(Date.now() - windowMs) } } });
    if (count >= limit) throw new Error("Too many attempts. Please try again later.");
    await tx.loginAttempt.create({ data: { key } });
  });
  // Cleanup is best effort and must not produce unhandled promise rejections.
  void db.loginAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }).catch(() => {});
}

export async function enforceLoginRateLimit(identifier: string) {
  return enforceRateLimit(`login:${identifier.toLowerCase()}`, 15 * 60 * 1000, 8);
}

export async function enforceEnquiryRateLimit(identifier: string) {
  return enforceRateLimit(`enquiry:${identifier.toLowerCase()}`, 60 * 60 * 1000, 5);
}
