import Link from "next/link";
import { getCategories } from "@/lib/catalogue";

export async function Footer() {
  const categories = await getCategories();
  return <footer className="site-footer"><div className="shell footer-grid">
    <section><p className="footer-kicker">INNOVATIVE GENERATOR PARTS</p><p className="footer-intro">A catalogue of generator components for maintenance, repair and dependable operation.</p><Link href="/request-quote" className="text-link">Need help identifying a part? <span>→</span></Link></section>
    <section><h2>Categories</h2>{categories.slice(0, 6).map(category => <Link key={category.id} href={`/categories/${category.slug}`}>{category.name}</Link>)}</section>
    <section><h2>Support</h2><Link href="/products">Browse all parts</Link><Link href="/request-quote">Request a quote</Link><Link href="/contact">Part identification</Link><Link href="/about">About IGP</Link></section>
    <section><h2>Contact</h2><p>Contact details are being prepared for publication.</p><p className="footer-muted">Configure phone, email, address and business hours in Site Settings before launch.</p></section>
  </div><div className="shell footer-bottom"><span>© {new Date().getFullYear()} Innovative Generator Parts</span><span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></span></div></footer>;
}
