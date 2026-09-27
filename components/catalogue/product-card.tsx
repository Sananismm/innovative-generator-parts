import Image from "next/image";
import Link from "next/link";
import type { CatalogueProduct } from "@/lib/types";
import { WhatsAppButton } from "@/components/catalogue/whatsapp-button";

export function ProductCard({ product }: { product: CatalogueProduct }) {
  return <article className="product-card"><Link href={`/products/${product.slug}`} className="product-image" aria-label={`View ${product.name}`}>
    {product.image ? <Image src={product.image} alt={product.imageAlt || product.name} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 25vw" /> : <span className="product-image-fallback" aria-hidden="true">IGP</span>}
  </Link><div className="product-card-body"><p className="eyebrow">{product.category.name}</p><h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
    <p>{product.shortDescription || product.dailyUse}</p><div className="card-actions"><Link href={`/products/${product.slug}`}>View details <span aria-hidden="true">→</span></Link><WhatsAppButton product={product} compact /></div></div></article>;
}
