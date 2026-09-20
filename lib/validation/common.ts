import { z } from "zod";

export const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
export const email = z.string().trim().email("Enter a valid email address.").max(254);
export const slug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only.").max(180);
export const positiveInteger = z.coerce.number().int().positive().max(100000).optional();
