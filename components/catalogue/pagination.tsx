import Link from "next/link";

export function Pagination({ total, page, pageSize, pathname, search }: { total: number; page: number; pageSize: number; pathname: string; search: Record<string, string | undefined> }) {
  const pages = Math.ceil(total / pageSize); if (pages <= 1) return null;
  const href = (next: number) => { const params = new URLSearchParams(Object.entries({ ...search, page: String(next) }).filter(([, value]) => value)); return `${pathname}?${params}`; };
  return <nav className="pagination" aria-label="Catalogue pagination"><span>Page {page} of {pages}</span>{page > 1 && <Link href={href(page - 1)}>Previous</Link>}{page < pages && <Link href={href(page + 1)}>Next</Link>}</nav>;
}
