import { getApiBaseUrl } from '../config/backend';

export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path || !String(path).trim()) return undefined;
  let p = String(path).trim();
  const base = getApiBaseUrl().replace(/\/$/, '');
  if (p.includes('localhost:8000')) {
    p = p.replace('http://localhost:8000', base).replace('https://localhost:8000', base);
  }
  if (p.includes('127.0.0.1:8000')) {
    p = p.replace('http://127.0.0.1:8000', base).replace('https://127.0.0.1:8000', base);
  }
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  if (p.startsWith('file://')) return p;
  return `${base}${p.startsWith('/') ? p : `/${p}`}`;
}
