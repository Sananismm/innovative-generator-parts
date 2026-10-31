"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const links = [
  ["Products", "/products"], ["Categories", "/categories"], ["About", "/about"], ["Contact", "/contact"],
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    let previousY = Math.max(0, window.scrollY);
    setScrolled(previousY > 8);

    function onScroll() {
      const currentY = Math.max(0, window.scrollY);
      setScrolled(currentY > 8);
      if (currentY <= 80) {
        setHidden(false);
      } else if (currentY > previousY) {
        setHidden(true);
        if (menu.current && !menu.current.querySelector(":focus-visible")) menu.current.open = false;
      } else if (currentY < previousY) {
        setHidden(false);
      }
      previousY = currentY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <header className="site-header" data-scrolled={scrolled} data-hidden={hidden}><div className="shell header-shell">
    <Link className="brand" href="/" aria-label="Innovative Generator Parts home"><Image src="/assets/igp-logo.png" alt="Innovative Generator Parts" width={1536} height={1024} priority /></Link>
    <nav className="desktop-nav" aria-label="Main navigation"><Link href="/">Home</Link>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    <div className="header-cta"><Link className="button button-primary" href="/request-quote">Request quote <span aria-hidden="true">↗</span></Link>
      <details ref={menu} className="mobile-nav"><summary aria-label="Open menu"><span></span><span></span></summary><nav aria-label="Mobile navigation"><Link href="/">Home</Link>{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}<Link className="button button-primary" href="/request-quote">Request quote</Link></nav></details>
    </div>
  </div></header>;
}
