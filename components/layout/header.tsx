import Image from "next/image";
import Link from "next/link";

const links = [
  ["Products", "/products"], ["Categories", "/categories"], ["About", "/about"], ["Contact", "/contact"],
] as const;

export function Header() {
  return <header className="site-header"><div className="shell header-shell">
    <Link className="brand" href="/" aria-label="Innovative Generator Parts home"><Image src="/assets/igp-logo.png" alt="Innovative Generator Parts" width={1536} height={1024} priority /></Link>
    <nav className="desktop-nav" aria-label="Main navigation"><Link href="/">Home</Link>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    <div className="header-cta"><Link className="button button-primary" href="/request-quote">Request quote <span aria-hidden="true">↗</span></Link>
      <details className="mobile-nav"><summary aria-label="Open menu"><span></span><span></span></summary><nav aria-label="Mobile navigation"><Link href="/">Home</Link>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}<Link className="button button-primary" href="/request-quote">Request quote</Link></nav></details>
    </div>
  </div></header>;
}
