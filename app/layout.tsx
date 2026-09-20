import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

const origin = process.env.APP_URL || "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: { default: "Innovative Generator Parts", template: "%s | Innovative Generator Parts" },
  description: "Generator parts and replacement components across engine, fuel, cooling, lubrication, electrical, control and related generator systems.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Innovative Generator Parts", title: "Innovative Generator Parts", description: "Dependable parts. Dependable power.", images: [{ url: "/assets/generator-hero.webp", width: 1881, height: 836, alt: "Industrial generator engine" }] },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#022561" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: "Innovative Generator Parts", url: origin, logo: `${origin}/assets/igp-logo.png` };
  const website = { "@context": "https://schema.org", "@type": "WebSite", name: "Innovative Generator Parts", url: origin, potentialAction: { "@type": "SearchAction", target: `${origin}/products?query={search_term_string}`, "query-input": "required name=search_term_string" } };
  return <html lang="en"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([organization, website]) }} /><a className="skip-link" href="#main">Skip to content</a><Header /><main id="main">{children}</main><Footer /></body></html>;
}
