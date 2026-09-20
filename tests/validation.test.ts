import { describe, expect, it } from "vitest";
import { enquirySchema } from "../lib/validation/enquiry";
import { productSchema } from "../lib/validation/product";

describe("server validation", () => {
  it("rejects incomplete quote requests", () => {
    expect(enquirySchema.safeParse({ name: "", email: "invalid" }).success).toBe(false);
  });

  it("accepts a valid product payload", () => {
    const parsed = productSchema.safeParse({ name: "Fuel injection pump", slug: "fuel-injection-pump", categoryId: "clx1234567890123456789012", workingPrinciple: "Delivers controlled fuel pressure.", dailyUse: "Used on industrial generator engines.", shortDescription: "Fuel delivery part", description: "Detailed technical content.", manufacturer: "IGP", partNumber: "IGP-001", oemReference: "OEM-001", engineFamily: "Diesel", image: "/assets/products/sample.webp", imageAlt: "Fuel pump", featured: false, popular: false, status: "DRAFT", seoTitle: "Fuel Injection Pump", seoDescription: "A generator fuel injection pump." });
    expect(parsed.success).toBe(true);
  });
});
