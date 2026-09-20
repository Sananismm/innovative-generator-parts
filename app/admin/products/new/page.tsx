import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/lib/db";

export default async function NewProductPage() { const categories = await db.category.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: "asc" } }); return <><header className="admin-page-heading"><p className="eyebrow">Catalogue management</p><h1>New product</h1><p>Leave manufacturer, compatibility, part number and specifications empty until verified information is available.</p></header><ProductForm categories={categories} /></>; }
