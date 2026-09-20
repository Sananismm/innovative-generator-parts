import type { Metadata } from "next";
import Link from "next/link";
import { QuoteForm } from "@/components/catalogue/quote-form";
import { getProductBySlug } from "@/lib/catalogue";

export const metadata: Metadata = { title: "Request a Quote", description: "Request a generator part quote or ask IGP to help identify a replacement component.", alternates: { canonical: "/request-quote" } };
export default async function QuotePage({ searchParams }: { searchParams: Promise<{ product?: string }> }) { const { product: slug } = await searchParams; const product = slug ? await getProductBySlug(slug) : null; return <div className="page shell quote-page"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Request a quote</span></nav><div className="quote-heading"><div><p className="eyebrow">Part identification and enquiries</p><h1>Tell us what you need.</h1><p>Send the information you have. A product name is helpful, but a generator model, part number, serial number or reference photo can also help identify the appropriate component.</p><ul><li>Product photos, nameplate images and PDFs supported</li><li>Required information is validated before it is stored</li><li>Enquiries are visible only to authorised IGP users</li></ul></div><QuoteForm productName={product?.name} productId={product?.id} /></div></div>; }
