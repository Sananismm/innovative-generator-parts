import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ authorize: vi.fn(), find: vi.fn(), get: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireRole: mocks.authorize }));
vi.mock("@/lib/db", () => ({ db: { enquiryAttachment: { findUnique: mocks.find } } }));
vi.mock("@vercel/blob", () => ({ get: mocks.get }));
import { GET } from "../app/admin/enquiries/attachments/[id]/route";

const context = { params: Promise.resolve({ id: "attachment-id" }) };
const request = () => new Request("https://example.test/admin/enquiries/attachments/attachment-id");

describe("private enquiry attachments", () => {
  beforeEach(() => { vi.resetAllMocks(); mocks.authorize.mockResolvedValue({}); });
  it("checks authorization before reading any attachment", async () => {
    mocks.authorize.mockRejectedValueOnce(new Error("unauthorized"));
    await expect(GET(request(), context)).rejects.toThrow("unauthorized");
    expect(mocks.find).not.toHaveBeenCalled(); expect(mocks.get).not.toHaveBeenCalled();
  });
  it("returns a private download to an authorized user", async () => {
    mocks.find.mockResolvedValueOnce({ url: "https://private.example.test/file", filename: "photo.png" });
    mocks.get.mockResolvedValueOnce({ statusCode: 200, stream: new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array([1, 2])); controller.close(); } }) });
    const response = await GET(request(), context);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("content-disposition")).toContain("attachment");
    expect(mocks.get).toHaveBeenCalledWith("https://private.example.test/file", expect.objectContaining({ access: "private" }));
  });
});
