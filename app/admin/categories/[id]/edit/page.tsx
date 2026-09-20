import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { db } from "@/lib/db";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const category = await db.category.findUnique({ where: { id } }); if (!category) notFound(); return <><header className="admin-page-heading"><p className="eyebrow">Catalogue management</p><h1>Edit category</h1><p>Update the category page and its search metadata.</p></header><CategoryForm category={category} /></>; }
