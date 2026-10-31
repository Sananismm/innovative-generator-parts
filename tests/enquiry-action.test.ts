import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ create: vi.fn(), upload: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: { enquiry: { create: mocks.create } } }));
vi.mock("@/lib/storage/uploads", () => ({ storeUpload: mocks.upload }));
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
  beforeEach(() => { vi.clearAllMocks(); mocks.create.mockResolvedValue({ id: "test" }); });
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
});
