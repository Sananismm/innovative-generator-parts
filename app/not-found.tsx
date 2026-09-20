import Link from "next/link";
export default function NotFound() { return <div className="page shell empty-state page-not-found"><p className="eyebrow">404</p><h1>That page could not be found.</h1><p>The product may have moved, been archived or the link may be incomplete.</p><Link className="button button-primary" href="/products">Browse parts</Link></div>; }
