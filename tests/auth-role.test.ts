import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@prisma/client";
import { SignJWT } from "jose";

const mocks = vi.hoisted(() => ({ token: "", find: vi.fn(), transaction: vi.fn(), lock: vi.fn(), count: vi.fn(), create: vi.fn(), cleanup: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: mocks.token }) }) }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`redirect:${path}`); } }));
vi.mock("@/lib/db", () => ({ db: { user: { findUnique: mocks.find }, $transaction: mocks.transaction, loginAttempt: { deleteMany: mocks.cleanup } } }));
import { enforceLoginRateLimit, requireRole } from "../lib/auth";

describe("current administrator permissions", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    vi.stubEnv("AUTH_SECRET", "a-test-only-secret-at-least-32-characters-long");
    mocks.token = await new SignJWT({ role: Role.ADMIN, email: "user@example.test" }).setProtectedHeader({ alg: "HS256" }).setSubject("user-id").setExpirationTime("1h").sign(new TextEncoder().encode(process.env.AUTH_SECRET));
  });
  it("rejects a deleted user even with a valid signed cookie", async () => {
    mocks.find.mockResolvedValue(null);
    await expect(requireRole([Role.ADMIN])).rejects.toThrow("redirect:/login");
  });
  it("enforces the current database role after demotion", async () => {
    mocks.find.mockResolvedValue({ id: "user-id", email: "user@example.test", role: Role.EDITOR });
    await expect(requireRole([Role.ADMIN])).rejects.toThrow("redirect:/login?error=forbidden");
    await expect(requireRole([Role.ADMIN, Role.EDITOR])).resolves.toMatchObject({ role: Role.EDITOR });
  });
});

describe("login rate limiting", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.transaction.mockImplementation(async fn => fn({ $executeRaw: mocks.lock, loginAttempt: { count: mocks.count, create: mocks.create } }));
    mocks.cleanup.mockResolvedValue({ count: 0 });
  });
  it("locks the key and records an allowed attempt", async () => {
    mocks.count.mockResolvedValue(7);
    await enforceLoginRateLimit("USER@example.test");
    expect(mocks.lock).toHaveBeenCalledOnce();
    expect(mocks.create).toHaveBeenCalledWith({ data: { key: "login:user@example.test" } });
    expect(mocks.lock.mock.invocationCallOrder[0]).toBeLessThan(mocks.count.mock.invocationCallOrder[0]);
  });
  it("does not add an attempt when the limit is reached", async () => {
    mocks.count.mockResolvedValue(8);
    await expect(enforceLoginRateLimit("user@example.test")).rejects.toThrow("Too many attempts");
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
