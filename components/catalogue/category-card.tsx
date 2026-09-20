import Image from "next/image";
import Link from "next/link";
import type { CatalogueCategory } from "@/lib/types";

const categoryVisuals: Record<string, { src: string; alt: string; position?: string }> = {
  "engine-parts": { src: "/assets/categories/engine-parts.webp", alt: "Generator engine components", position: "center 38%" },
  "fuel-system": { src: "/assets/categories/fuel-system.webp", alt: "Generator fuel-system components" },
  "cooling-system": { src: "/assets/categories/cooling-system.webp", alt: "Generator cooling-system pipework" },
  "lubrication-system": { src: "/assets/categories/lubrication-system.webp", alt: "Industrial lubrication-system equipment", position: "68% center" },
  "air-exhaust": { src: "/assets/categories/air-exhaust.webp", alt: "Industrial air and exhaust outlet" },
  "electrical-alternator": { src: "/assets/categories/electrical-alternator.webp", alt: "Generator alternator assembly" },
  "control-protection": { src: "/assets/categories/control-protection.webp", alt: "Generator control and protection panel", position: "38% center" },
  "consumables-replacement-parts": { src: "/assets/categories/replacement-parts.webp", alt: "Generator replacement parts" },
};

type CategoryCardProps = { category: CatalogueCategory; index: number };

export function CategoryCard({ category, index }: CategoryCardProps) {
  const visual = categoryVisuals[category.slug];

  return (
    <Link className="category-card" href={`/categories/${category.slug}`}>
      {visual ? <><Image alt={visual.alt} className="category-card-image" fill sizes="(max-width: 430px) 100vw, (max-width: 1100px) 50vw, 25vw" src={visual.src} style={{ objectPosition: visual.position }} /><span aria-hidden="true" className="category-card-overlay" /></> : null}
      <span className="category-card-number">{String(index + 1).padStart(2, "0")}</span>
      <span className="category-card-content"><strong>{category.name}</strong><small>{category.productCount} components</small></span>
      <i aria-hidden="true">↗</i>
    </Link>
  );
}
