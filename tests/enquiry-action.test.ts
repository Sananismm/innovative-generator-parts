import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const mocks = vi.hoisted(() => ({ create: vi.fn(), findUnique: vi.fn(), upload: vi.fn(), remove: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: { enquiry: { create: mocks.create, findUnique: mocks.findUnique } } }));
vi.mock("@/lib/storage/uploads", () => ({ storeUpload: mocks.upload, deleteUpload: mocks.remove }));
vi.mock("@/lib/auth", () => ({ assertSameOrigin: vi.fn(), enforceEnquiryRateLimit: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { submitEnquiryAction } from "../app/actions";

function request(withFile = true) {
  const form = new FormData();
  form.set("name", "Test Customer"); form.set("email", "customer@example.test");
  if (withFile) form.set("attachment", new File(["test"], "part.pdf", { type: "application/pdf" }));
  return form;
}

describe("enquiry submission", () => {
  beforeEach(() => { vi.resetAllMocks(); mocks.create.mockResolvedValue({ id: "test" }); mocks.findUnique.mockResolvedValue(null); });
  it("does not create an enquiry when uploading fails", async () => {
    mocks.upload.mockRejectedValueOnce(new Error("upload failed"));
    const result = await submitEnquiryAction({}, request());
    expect(result.error).toBeTruthy();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("saves an attachment with its enquiry in one database operation", async () => {
    const upload = { url: "https://example.test/file", filename: "part.pdf", size: 4, contentType: "application/pdf" };
    mocks.upload.mockResolvedValueOnce(upload);
    expect((await submitEnquiryAction({}, request())).success).toBeTruthy();
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ attachments: { create: upload } }) }));
  });
  it("reports success after a saved enquiry even if cache revalidation fails", async () => {
    mocks.revalidate.mockImplementationOnce(() => { throw new Error("cache unavailable"); });
    expect((await submitEnquiryAction({}, request(false))).success).toBeTruthy();
    expect(mocks.create).toHaveBeenCalledOnce();
  });
  it("recognizes an existing submission and avoids creating or uploading it again", async () => {
    const form = request(); form.set("submissionId", "dca477e2-6d77-4e9f-99ac-a694618fc32d");
    mocks.findUnique.mockResolvedValueOnce({ email: "customer@example.test" });
    expect((await submitEnquiryAction({}, form)).success).toBeTruthy();
    expect(mocks.create).not.toHaveBeenCalled(); expect(mocks.upload).not.toHaveBeenCalled();
  });
  it("recognizes a successful commit even when the create call times out", async () => {
    const form = request(false); form.set("submissionId", "dca477e2-6d77-4e9f-99ac-a694618fc32d");
    mocks.create.mockRejectedValueOnce(new Error("timeout"));
    mocks.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ email: "customer@example.test" });
    expect((await submitEnquiryAction({}, form)).success).toBeTruthy();
  });
  it("cleans up its uploaded file after a definite rejected insert", async () => {
    const upload = { url: "https://example.test/file", filename: "part.pdf", size: 4, contentType: "application/pdf" };
    mocks.upload.mockResolvedValueOnce(upload);
    mocks.create.mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError("constraint", { code: "P2003", clientVersion: "test" }));
    expect((await submitEnquiryAction({}, request())).error).toBeTruthy();
    expect(mocks.remove).toHaveBeenCalledWith(upload);
  });
  it("retains the file when a timeout leaves the commit outcome uncertain", async () => {
    mocks.upload.mockResolvedValueOnce({ url: "https://example.test/file", filename: "part.pdf", size: 4, contentType: "application/pdf" });
    mocks.create.mockRejectedValueOnce(new Error("timeout"));
    mocks.findUnique.mockResolvedValueOnce(null).mockRejectedValueOnce(new Error("unavailable"));
    expect((await submitEnquiryAction({}, request())).error).toBeTruthy();
    expect(mocks.remove).not.toHaveBeenCalled();
  });
});
