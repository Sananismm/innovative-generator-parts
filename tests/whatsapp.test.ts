import { afterEach, describe, expect, it, vi } from "vitest";
import { buildWhatsAppContactUrl, buildWhatsAppUrl } from "../lib/whatsapp";

describe("WhatsApp links", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("creates a general enquiry to the approved public number", () => {
    const url = new URL(buildWhatsAppContactUrl()!);
    expect(url.origin + url.pathname).toBe("https://wa.me/923008877677");
    expect(url.searchParams.get("text")).toContain("information about your generator parts");
  });

  it("does not use an outdated environment number", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "923001234567");
    expect(new URL(buildWhatsAppContactUrl()).pathname).toBe("/923008877677");
    expect(new URL(buildWhatsAppUrl({ name: "Fuel Pump", slug: "fuel-pump" })).pathname).toBe("/923008877677");
  });

  it("preserves product-specific links", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.test");
    const url = new URL(buildWhatsAppUrl({ name: "Fuel Pump", slug: "fuel-pump" })!);
    expect(url.searchParams.get("text")).toContain("https://example.test/products/fuel-pump");
  });
});
