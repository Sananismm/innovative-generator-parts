export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function safeInteger(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function appUrl(path = "/") {
  const base = process.env.APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
  return new URL(path, `${base}/`).toString();
}

export function pluralize(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}
