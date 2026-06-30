import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Leaf, Drumstick } from "lucide-react";
import { motion } from "framer-motion";
import menuData from "@/data/menu.json";
import { site, type MenuCategory } from "@/data/content";
import { Reveal } from "@/components/site/Reveal";
import { PageHeader, CtaBand } from "@/components/site/ui";
import { TiltCard } from "@/components/site/TiltCard";
import { breadcrumbLd } from "@/lib/seo";

const categories = menuData as MenuCategory[];

const NONVEG = /chicken|mutton|fish|prawn|egg|lamb|keema|kheema|murg|tangri|lollipop|kalami|drumstick|seekh|tikka chicken|chick /i;
function isNonVeg(name: string, cat: string) {
  if (/non-?veg/i.test(cat)) return true;
  if (/^(veg|tandoori veg|chinese veg)/i.test(cat)) return NONVEG.test(name);
  return NONVEG.test(name);
}

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Our Menu — Nice Hotel And Restaurant, Mansa" },
      { name: "description", content: "Explore 300+ dishes across 19 categories at Nice Hotel And Restaurant, Mansa — beverages, soups, tandoori, main course, breads, desserts and more." },
      { property: "og:title", content: "Our Restaurant Menu" },
      { property: "og:url", content: "/menu" },
      { property: "og:image", content: site.images.dining },
      { name: "twitter:image", content: site.images.dining },
    ],
    links: [{ rel: "canonical", href: "/menu" }],
    scripts: [
      breadcrumbLd([{ name: "Home", path: "/" }, { name: "Menu", path: "/menu" }]),
      {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org", "@type": "Menu", name: "Nice Hotel And Restaurant Menu",
        hasMenuSection: categories.map((c) => ({
          "@type": "MenuSection", name: c.category,
          hasMenuItem: c.items.map((i) => ({ "@type": "MenuItem", name: i.name, offers: { "@type": "Offer", price: i.price.replace(/[^\d|]/g, ""), priceCurrency: "INR" } })),
        })),
      }),
      },
    ],
  }),
  component: Menu,
});

function Menu() {
  const [active, setActive] = useState("All");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "veg" | "nonveg">("all");

  const visible = useMemo(() => {
    return categories
      .filter((c) => active === "All" || c.category === active)
      .map((c) => ({
        ...c,
        items: c.items.filter((it) => {
          if (q && !it.name.toLowerCase().includes(q.toLowerCase())) return false;
          const nv = isNonVeg(it.name, c.category);
          if (filter === "veg" && nv) return false;
          if (filter === "nonveg" && !nv) return false;
          return true;
        }),
      }))
      .filter((c) => c.items.length > 0);
  }, [active, q, filter]);

  return (
    <>
      <PageHeader eyebrow="Fine Dining" title="Our Menu" sub="Experience the finest flavors crafted with passion and tradition" image={site.images.dining} />

      {/* Sticky controls */}
      <div className="sticky top-16 z-40 border-b border-border bg-ivory/95 backdrop-blur-md">
        <div className="container-luxe py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes..."
                aria-label="Search dishes"
                className="w-full rounded-full border border-border bg-white/70 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold" />
            </div>
            <div className="flex gap-2">
              {([["all", "All"], ["veg", "Veg"], ["nonveg", "Non-Veg"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)}
                  className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition ${filter === k ? "bg-gold text-ivory" : "bg-beige text-brown hover:bg-gold/20"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {["All", ...categories.map((c) => c.category)].map((c) => (
              <button key={c} onClick={() => setActive(c)}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs transition ${active === c ? "border-gold bg-gold text-ivory" : "border-border text-brown hover:border-gold"}`}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <section className="container-luxe py-16">
        {visible.length === 0 && <p className="py-20 text-center text-muted-foreground">No dishes match your search.</p>}
        <div className="space-y-16">
          {visible.map((cat) => (
            <Reveal key={cat.category}>
            <TiltCard max={4} className="group">
            <div id={cat.category} className="rounded-2xl border border-border/70 bg-card/90 p-7 shadow-card md:p-10" style={{ transformStyle: "preserve-3d" }}>
              <div className="mb-8 flex items-end justify-between border-b border-border pb-4" style={{ transform: "translateZ(40px)" }}>
                <h2 className="font-display text-3xl text-charcoal md:text-4xl">{cat.category}</h2>
                <span className="text-xs uppercase tracking-[0.2em] text-gold">{cat.items.length} dishes</span>
              </div>
              <div className="grid grid-cols-1 gap-x-12 gap-y-5 md:grid-cols-2" style={{ transform: "translateZ(20px)" }}>
                {cat.items.map((it, i) => {
                  const nv = isNonVeg(it.name, cat.category);
                  return (
                    <motion.div key={it.name + i}
                      initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.4, delay: (i % 8) * 0.03 }}
                      className="group flex items-baseline gap-3">
                      <span className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${nv ? "border-red-700 text-red-700" : "border-green-700 text-green-700"}`} aria-label={nv ? "Non-vegetarian" : "Vegetarian"}>
                        {nv ? <Drumstick className="h-2.5 w-2.5" /> : <Leaf className="h-2.5 w-2.5" />}
                      </span>
                      <span className="font-body text-charcoal">{it.name}</span>
                      <span className="mx-2 flex-1 translate-y-[-3px] border-b border-dotted border-border" />
                      <span className="font-display text-lg text-gold">{it.price}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            </TiltCard>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-16 rounded-2xl bg-beige p-7 text-center text-sm text-brown">
          <p>GST Extra · Please wait for 30 minutes after placing an order.</p>
          <p className="mt-1">Room Service: {site.roomService} &nbsp;|&nbsp; Suggestions: {site.suggestions}</p>
        </Reveal>
      </section>

      <CtaBand title="Reserve Your Table" sub="Book your stay now and enjoy world-class hospitality at Nice Hotel" image={site.images.dining} />
    </>
  );
}
