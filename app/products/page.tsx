import type { Metadata } from "next";
import { CatalogueControls } from "@/components/catalogue/catalogue-controls";
import { Pagination } from "@/components/catalogue/pagination";
import { ProductCard } from "@/components/catalogue/product-card";
import { getCategories, getProducts } from "@/lib/catalogue";

export const metadata: Metadata = { title: "Generator Parts Catalogue", description: "Browse generator replacement components across engine, fuel, cooling, lubrication, electrical and control systems.", alternates: { canonical: "/products" } };
export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams; const search = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
  const sort = search.sort === "name" || search.sort === "latest" ? search.sort : "featured";
  const page = Number(search.page) || 1;
  const [categories, result] = await Promise.all([getCategories(), getProducts({ query: search.query, category: search.category, manufacturer: search.manufacturer, tag: search.tag, sort, page, pageSize: 24 })]);
  return <div className="page shell"><nav className="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>Products</span></nav><header className="page-heading"><p className="eyebrow">Complete catalogue</p><h1>Generator parts<br />for every major system.</h1><p>Search the current catalogue or narrow it by the system you are servicing.</p></header><CatalogueControls categories={categories} /><p className="results-count">{result.total} components found{!result.database && <span> · Database preview mode</span>}</p>{result.items.length ? <><div className="product-grid catalogue-grid">{result.items.map(product => <ProductCard product={product} key={product.id} />)}</div><Pagination total={result.total} page={result.page} pageSize={result.pageSize} pathname="/products" search={search} /></> : <div className="empty-state"><h2>No matching parts found.</h2><p>Try a broader term or clear the filters to view the complete catalogue.</p><a className="button button-dark" href="/products">Clear filters</a></div>}</div>;
}
