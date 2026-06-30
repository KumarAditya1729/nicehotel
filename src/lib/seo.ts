const SITE_URL = "https://www.nicehotelandrestaurant.online";

/** JSON-LD BreadcrumbList script entry for a leaf route. */
export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    type: "application/ld+json" as const,
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: trail.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        item: `${SITE_URL}${t.path === "/" ? "" : t.path}`,
      })),
    }),
  };
}
