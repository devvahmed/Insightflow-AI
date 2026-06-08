import { getApiBaseUrl } from '../config/backend';

export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path || !String(path).trim()) return undefined;
  let p = String(path).trim();
  if (p.includes('localhost:8000')) {
    const base = getApiBaseUrl().replace(/\/$/, '');
    p = p.replace('http://localhost:8000', base);
  }
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  if (p.startsWith('file://')) return p;
  const base = getApiBaseUrl().replace(/\/$/, '');
  return `${base}${p.startsWith('/') ? p : `/${p}`}`;
}
