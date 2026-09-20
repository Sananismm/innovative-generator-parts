import { z } from "zod";
import { email, optionalText, positiveInteger } from "@/lib/validation/common";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  company: optionalText(160),
  email,
  phone: optionalText(40),
  productId: optionalText(100),
  productName: optionalText(200),
  partNumber: optionalText(120),
  generatorBrand: optionalText(120),
  generatorModel: optionalText(160),
  engineManufacturer: optionalText(120),
  serialNumber: optionalText(160),
  quantity: positiveInteger,
  message: optionalText(4000),
});

export const permittedUploadTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
