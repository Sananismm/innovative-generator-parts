import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { slugify } from "@/lib/utils";

type LegacyProduct = {
  id: string;
  name: string;
  category: string;
  workingPrinciple: string;
  dailyUse: string;
  image: string;
  featured: boolean;
};

type LegacyCatalogue = { categories: string[]; products: LegacyProduct[] };

let cache: LegacyCatalogue | undefined;

/** Reads the existing source of truth without duplicating the 80 supplied records. */
export function getLegacyCatalogue(): LegacyCatalogue {
  if (cache) return cache;
  const script = readFileSync(join(process.cwd(), "data", "products.js"), "utf8");
  const sandbox: { window: { IGP_CATALOGUE?: LegacyCatalogue } } = { window: {} };
  vm.runInNewContext(script, sandbox, { timeout: 1000 });
  if (!sandbox.window.IGP_CATALOGUE) throw new Error("Catalogue source could not be read.");
  cache = sandbox.window.IGP_CATALOGUE;
  return cache;
}

export function legacyProductSlug(product: LegacyProduct) {
  // Category prefix keeps intentional duplicate names (for example filters and AVR) addressable.
  return `${slugify(product.category)}-${slugify(product.name)}`;
}
