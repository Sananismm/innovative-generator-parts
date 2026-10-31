import { afterEach, describe, expect, it, vi } from "vitest";
import { buildWhatsAppContactUrl, buildWhatsAppUrl } from "../lib/whatsapp";

describe("WhatsApp links", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("creates a general enquiry with the configured number and encoded message", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "923001234567");
    const url = new URL(buildWhatsAppContactUrl()!);
    expect(url.origin + url.pathname).toBe("https://wa.me/923001234567");
    expect(url.searchParams.get("text")).toContain("information about your generator parts");
  });

  it("does not render a contact link without a configured number", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "");
    expect(buildWhatsAppContactUrl()).toBeNull();
    expect(buildWhatsAppUrl({ name: "Fuel Pump", slug: "fuel-pump" })).toBeNull();
  });

  it("preserves product-specific links", () => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "923001234567");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.test");
    const url = new URL(buildWhatsAppUrl({ name: "Fuel Pump", slug: "fuel-pump" })!);
    expect(url.searchParams.get("text")).toContain("https://example.test/products/fuel-pump");
  });
});
