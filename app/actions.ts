"use server";

import bcrypt from "bcryptjs";
import { EnquiryStatus, ProductStatus, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, createSession, assertSameOrigin, enforceEnquiryRateLimit, enforceLoginRateLimit, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeUpload } from "@/lib/storage/uploads";
import { enquirySchema } from "@/lib/validation/enquiry";
import { categorySchema, productSchema } from "@/lib/validation/product";

export type FormState = { error?: string; success?: string; fieldErrors?: Record<string, string[]> };

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}
function productInput(formData: FormData) {
  return {
    id: stringValue(formData, "id") || undefined,
    name: stringValue(formData, "name"), slug: stringValue(formData, "slug"), categoryId: stringValue(formData, "categoryId"),
    shortDescription: stringValue(formData, "shortDescription"), description: stringValue(formData, "description"),
    workingPrinciple: stringValue(formData, "workingPrinciple"), dailyUse: stringValue(formData, "dailyUse"),
    manufacturer: stringValue(formData, "manufacturer"), partNumber: stringValue(formData, "partNumber"), oemReference: stringValue(formData, "oemReference"), engineFamily: stringValue(formData, "engineFamily"),
    image: stringValue(formData, "image"), imageAlt: stringValue(formData, "imageAlt"), featured: formData.get("featured") === "on", popular: formData.get("popular") === "on",
    status: stringValue(formData, "status"), seoTitle: stringValue(formData, "seoTitle"), seoDescription: stringValue(formData, "seoDescription"),
  };
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  try {
    await assertSameOrigin();
    const email = stringValue(formData, "email").trim().toLowerCase();
    const password = stringValue(formData, "password");
    if (!email || !password) return { error: "Enter your email and password." };
    await enforceLoginRateLimit(email);
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return { error: "Email or password is incorrect." };
    await createSession({ userId: user.id, role: user.role, email: user.email });
  } catch (error) { return { error: error instanceof Error ? error.message : "Unable to sign in." }; }
  redirect("/admin");
}

export async function logoutAction() {
  await assertSameOrigin();
  await clearSession();
  redirect("/");
}

export async function saveProductAction(_: FormState, formData: FormData): Promise<FormState> {
  await assertSameOrigin();
  const session = await requireRole([Role.ADMIN, Role.EDITOR]);
  const parsed = productSchema.safeParse(productInput(formData));
  if (!parsed.success) return { error: "Review the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  const { id, ...data } = parsed.data;
  if (id) {
    const previous = await db.product.findUnique({ where: { id }, select: { slug: true } });
    if (!previous) return { error: "This product no longer exists." };
    if (previous.slug !== data.slug) {
      await db.productRedirect.upsert({ where: { oldSlug: previous.slug }, update: {}, create: { oldSlug: previous.slug, productId: id } });
    }
  }
  const product = id
    ? await db.product.update({ where: { id }, data: { ...data, status: data.status as ProductStatus, editedById: session.userId } })
    : await db.product.create({ data: { ...data, status: data.status as ProductStatus, editedById: session.userId } });
  revalidatePath("/"); revalidatePath("/products"); revalidatePath(`/products/${product.slug}`); revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}/edit?success=saved`);
}

export async function duplicateProductAction(formData: FormData) {
  await assertSameOrigin();
  const session = await requireRole([Role.ADMIN, Role.EDITOR]);
  const id = stringValue(formData, "id");
  const product = await db.product.findUnique({ where: { id } });
  if (!product) redirect("/admin/products");
  const copy = await db.product.create({ data: {
    name: `${product.name} (copy)`, slug: `${product.slug}-copy-${Date.now()}`, categoryId: product.categoryId,
    shortDescription: product.shortDescription, description: product.description, workingPrinciple: product.workingPrinciple,
    dailyUse: product.dailyUse, manufacturer: product.manufacturer, partNumber: product.partNumber,
    oemReference: product.oemReference, engineFamily: product.engineFamily, attributes: product.attributes ?? undefined,
    image: product.image, imageAlt: product.imageAlt, featured: false, popular: false, status: ProductStatus.DRAFT,
    seoTitle: product.seoTitle, seoDescription: product.seoDescription, editedById: session.userId,
  } });
  revalidatePath("/admin/products");
  redirect(`/admin/products/${copy.id}/edit?success=duplicated`);
}

export async function archiveProductAction(formData: FormData) {
  await assertSameOrigin(); await requireRole([Role.ADMIN, Role.EDITOR]);
  const id = stringValue(formData, "id");
  await db.product.update({ where: { id }, data: { status: ProductStatus.ARCHIVED } });
  revalidatePath("/"); revalidatePath("/products"); revalidatePath("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await assertSameOrigin(); await requireRole([Role.ADMIN]);
  const id = stringValue(formData, "id");
  await db.product.delete({ where: { id } });
  revalidatePath("/"); revalidatePath("/products"); revalidatePath("/admin/products");
}

export async function saveCategoryAction(_: FormState, formData: FormData): Promise<FormState> {
  await assertSameOrigin(); await requireRole([Role.ADMIN, Role.EDITOR]);
  const parsed = categorySchema.safeParse({ id: stringValue(formData, "id") || undefined, name: stringValue(formData, "name"), slug: stringValue(formData, "slug"), description: stringValue(formData, "description"), image: stringValue(formData, "image"), imageAlt: stringValue(formData, "imageAlt"), sortOrder: stringValue(formData, "sortOrder"), status: stringValue(formData, "status"), seoTitle: stringValue(formData, "seoTitle"), seoDescription: stringValue(formData, "seoDescription") });
  if (!parsed.success) return { error: "Review the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  const { id, ...data } = parsed.data;
  if (id) await db.category.update({ where: { id }, data: { ...data, status: data.status as ProductStatus } });
  else await db.category.create({ data: { ...data, status: data.status as ProductStatus } });
  revalidatePath("/"); revalidatePath("/products"); revalidatePath("/categories"); revalidatePath("/admin/categories");
  return { success: "Category saved." };
}

export async function submitEnquiryAction(_: FormState, formData: FormData): Promise<FormState> {
  try {
    await assertSameOrigin();
    const raw = Object.fromEntries([...formData.entries()].filter(([key]) => key !== "attachment"));
    const parsed = enquirySchema.safeParse(raw);
    if (!parsed.success) return { error: "Please correct the highlighted information.", fieldErrors: parsed.error.flatten().fieldErrors };
    await enforceEnquiryRateLimit(parsed.data.email);
    const enquiry = await db.enquiry.create({ data: { ...parsed.data, productId: parsed.data.productId || null, quantity: parsed.data.quantity ?? null } });
    const attachment = formData.get("attachment");
    if (attachment instanceof File && attachment.size) {
      const upload = await storeUpload(attachment, "enquiries");
      await db.enquiryAttachment.create({ data: { ...upload, enquiryId: enquiry.id } });
    }
    revalidatePath("/admin/enquiries");
    return { success: "Your request has been received. The IGP team will review the information you provided." };
  } catch (error) { return { error: error instanceof Error ? error.message : "We could not submit your request. Please try again." }; }
}

export async function updateEnquiryStatusAction(formData: FormData) {
  await assertSameOrigin(); await requireRole([Role.ADMIN, Role.EDITOR]);
  const id = stringValue(formData, "id"); const status = stringValue(formData, "status");
  if (!Object.values(EnquiryStatus).includes(status as EnquiryStatus)) throw new Error("Invalid enquiry status.");
  await db.enquiry.update({ where: { id }, data: { status: status as EnquiryStatus } });
  revalidatePath("/admin/enquiries");
}
