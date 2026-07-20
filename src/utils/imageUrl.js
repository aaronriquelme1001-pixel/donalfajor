/**
 * Helper to resolve image URLs reliably in Vite / GitHub Pages / local environments.
 */
export function getImageUrl(src) {
  if (!src) return '';
  if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  // Strip any leading slash, ./, or docs/
  const clean = src.replace(/^(\/?docs\/|\.\/|\/)+/, '');
  const base = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
  return base ? `${base}/${clean}` : `/${clean}`;
}
