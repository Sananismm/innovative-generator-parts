import { z } from "zod";
import { optionalText, slug } from "@/lib/validation/common";

export const productSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(2, "Enter a product name.").max(180),
  slug,
  categoryId: z.string().cuid("Choose a category."),
  shortDescription: optionalText(280),
  description: optionalText(5000),
  workingPrinciple: z.string().trim().min(3, "Working principle is required.").max(5000),
  dailyUse: z.string().trim().min(3, "Daily use is required.").max(5000),
  manufacturer: optionalText(120),
  partNumber: optionalText(120),
  oemReference: optionalText(120),
  engineFamily: optionalText(120),
  image: optionalText(2048),
  imageAlt: optionalText(180),
  featured: z.boolean().default(false),
  popular: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  seoTitle: optionalText(70),
  seoDescription: optionalText(160),
});

export const categorySchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(2).max(120),
  slug,
  description: optionalText(1000),
  image: optionalText(2048),
  imageAlt: optionalText(180),
  sortOrder: z.coerce.number().int().min(0).max(999),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  seoTitle: optionalText(70),
  seoDescription: optionalText(160),
});
