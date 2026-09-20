import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/catalogue";

export const metadata: Metadata = { title: "Generator Part Categories", description: "Explore generator parts by engine, fuel, cooling, lubrication, air and exhaust, electrical, control and consumable systems.", alternates: { canonical: "/categories" } };
export default async function CategoriesPage() { const categories = await getCategories(); return <div className="page shell"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Categories</span></nav><header className="page-heading"><p className="eyebrow">Generator systems</p><h1>Browse parts by<br />the system they serve.</h1><p>Each system page brings relevant components and their functional descriptions together.</p></header><div className="category-index">{categories.map((category, index) => <Link key={category.id} href={`/categories/${category.slug}`}><span>0{index + 1}</span><h2>{category.name}</h2><p>{category.description}</p><small>{category.productCount} components</small><i aria-hidden="true">→</i></Link>)}</div></div>; }
