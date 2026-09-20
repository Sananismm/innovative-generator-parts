import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/lib/db";

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ success?: string }> }) { const [{ id }, { success }] = await Promise.all([params, searchParams]); const [product, categories] = await Promise.all([db.product.findUnique({ where: { id } }), db.category.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: "asc" } })]); if (!product) notFound(); return <><header className="admin-page-heading"><p className="eyebrow">Catalogue management</p><h1>Edit {product.name}</h1>{success && <p className="form-message success" role="status">Product saved.</p>}</header><ProductForm product={product} categories={categories} /></>; }
