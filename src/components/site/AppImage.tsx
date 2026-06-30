import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { resolveImageUrl, IMAGE_FALLBACK } from "@/lib/image";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  /** Any image value: string, array, or legacy { url, path, name } object. */
  src?: unknown;
  /** Custom fallback shown when src is empty or fails to load. */
  fallback?: string;
};

/**
 * Resilient image renderer used across the site. Resolves any image shape,
 * lazy-loads by default, shows a subtle placeholder while loading and swaps
 * to a branded fallback on error.
 */
export function AppImage({ src, fallback = IMAGE_FALLBACK, alt = "", className, loading = "lazy", ...rest }: Props) {
  const resolved = resolveImageUrl(src) ?? fallback;
  const [current, setCurrent] = useState(resolved);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCurrent(resolved);
    setLoaded(false);
  }, [resolved]);

  return (
    <img
      {...rest}
      src={current}
      alt={alt}
      loading={loading}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
      data-loaded={loaded}
      className={[className, "bg-[#efe9dd] transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0"].filter(Boolean).join(" ")}
    />
  );
}
