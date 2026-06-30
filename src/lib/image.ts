/**
 * Normalises any image value into a usable absolute/relative URL string.
 * Handles plain strings, arrays (first usable entry), and legacy storage
 * objects such as { url, signedUrl, publicUrl, src, path, name }.
 * Returns null when nothing usable is found.
 */
export function resolveImageUrl(input: unknown): string | null {
  if (input == null) return null;
  if (typeof input === "string") {
    const s = input.trim();
    return s.length ? s : null;
  }
  if (Array.isArray(input)) {
    for (const item of input) {
      const r = resolveImageUrl(item);
      if (r) return r;
    }
    return null;
  }
  if (typeof input === "object") {
    const o = input as Record<string, unknown>;
    return resolveImageUrl(
      o.url ?? o.signedUrl ?? o.publicUrl ?? o.src ?? o.path ?? null,
    );
  }
  return null;
}

/** Tiny inline SVG used when an image is missing or fails to load. */
export const IMAGE_FALLBACK =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
      <rect width='100%' height='100%' fill='#efe9dd'/>
      <text x='50%' y='50%' fill='#b98a3e' font-family='serif' font-size='20'
        text-anchor='middle' dominant-baseline='middle'>Nice Hotel</text>
    </svg>`,
  );
