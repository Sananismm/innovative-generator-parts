type WhatsAppProduct = { name: string; slug: string };

export function buildWhatsAppUrl(product: WhatsAppProduct) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  if (!phone) return null;
  const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const productUrl = `${base}/products/${product.slug}`;
  const text = `Hello Innovative Generator Parts,\n\nI'm interested in the following product:\n\n${product.name}\n\nProduct link:\n${productUrl}\n\nCould you please provide more information and a quotation?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
