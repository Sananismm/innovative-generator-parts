import type { CatalogueProduct } from "@/lib/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppButton({ product, compact = false }: { product: CatalogueProduct; compact?: boolean }) {
  const href = buildWhatsAppUrl(product);
  if (!href) return null;
  return <a className={compact ? "whatsapp-link" : "button button-outline whatsapp-button"} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Ask about ${product.name} on WhatsApp`}><span aria-hidden="true">◔</span>{compact ? "WhatsApp" : "Ask on WhatsApp"}</a>;
}
