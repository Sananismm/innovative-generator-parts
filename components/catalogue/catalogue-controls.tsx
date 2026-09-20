"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { CatalogueCategory } from "@/lib/types";

export function CatalogueControls({ categories }: { categories: CatalogueCategory[] }) {
  const router = useRouter(); const params = useSearchParams();
  function update(key: string, value: string) { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); next.delete("page"); router.push(`/products${next.size ? `?${next}` : ""}`); }
  const active = ["category", "manufacturer", "tag"].filter(key => params.get(key)).length;
  return <div className="catalogue-controls"><label className="search-input"><span className="sr-only">Search products</span><input defaultValue={params.get("query") || ""} onChange={event => update("query", event.target.value)} placeholder="Search parts, function or part number" type="search" /></label>
    <details className="filter-sheet"><summary>Filters{active ? ` (${active})` : ""}</summary><div className="filter-panel"><label>Category<select value={params.get("category") || ""} onChange={event => update("category", event.target.value)}><option value="">All categories</option>{categories.map(category => <option key={category.id} value={category.slug}>{category.name}</option>)}</select></label><button type="button" onClick={() => router.push("/products")}>Clear all</button></div></details>
    <label className="sort-select"><span className="sr-only">Sort products</span><select value={params.get("sort") || "featured"} onChange={event => update("sort", event.target.value)}><option value="featured">Featured first</option><option value="name">Name A–Z</option><option value="latest">Latest</option></select></label>
  </div>;
}
