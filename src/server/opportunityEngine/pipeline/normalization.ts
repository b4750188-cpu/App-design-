/**
 * Data Pipeline: Normalization & URL Sanitization
 */

export function normalizeUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  try {
    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const parsed = new URL(url);
    // Lowercase host
    parsed.hostname = parsed.hostname.toLowerCase();
    // Strip tracking parameters
    const searchParams = new URLSearchParams(parsed.search);
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    trackingParams.forEach((p) => searchParams.delete(p));
    parsed.search = searchParams.toString();
    // Remove trailing slash for canonical matching
    let clean = parsed.toString();
    if (clean.endsWith('/') && parsed.pathname === '/') {
      clean = clean.slice(0, -1);
    }
    return clean;
  } catch {
    return rawUrl.trim();
  }
}

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  } catch {
    return undefined;
  }
}
