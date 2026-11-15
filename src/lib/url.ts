const rawBase = import.meta.env.BASE_URL || "/";
const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

export function withBase(path: string): string {
  if (!path) return base;
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  return `${base}${path.replace(/^\//, "")}`;
}

export { base };
