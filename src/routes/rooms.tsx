import { AppImage } from "@/components/site/AppImage";
import { createFileRoute } from "@tanstack/react-router";
import { Star, Maximize, Users, Eye, Check } from "lucide-react";
import { site, rooms, whyChooseRooms } from "@/data/content";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/components/site/Icon";
import { PageHeader, SectionHeading, CtaBand } from "@/components/site/ui";
import { useBooking } from "@/components/site/booking";
import { TiltCard } from "@/components/site/TiltCard";
import { breadcrumbLd } from "@/lib/seo";
import { getRooms, getRoomAvailability } from "@/lib/public.functions";

export const Route = createFileRoute("/rooms")({
  loader: async () => {
    try {
      const [dbRooms, availability] = await Promise.all([getRooms(), getRoomAvailability()]);
      return { dbRooms, availability };
    } catch {
      return {
        dbRooms: [] as Awaited<ReturnType<typeof getRooms>>,
        availability: [] as Awaited<ReturnType<typeof getRoomAvailability>>,
      };
    }
  },
  head: () => ({
    meta: [
      { title: "Luxury Rooms & Suites — Nice Hotel And Restaurant, Mansa" },
      { name: "description", content: "Executive and Deluxe suites at Nice Hotel And Restaurant, Mansa. Premium amenities, king beds, smart TVs and city views from ₹1500/night." },
      { property: "og:title", content: "Luxury Rooms & Suites" },
      { property: "og:url", content: "/rooms" },
      { property: "og:image", content: site.images.executive },
      { name: "twitter:image", content: site.images.executive },
    ],
    links: [{ rel: "canonical", href: "/rooms" }],
    scripts: [breadcrumbLd([{ name: "Home", path: "/" }, { name: "Rooms", path: "/rooms" }])],
  }),
  errorComponent: () => (
    <div className="container-luxe py-32 text-center">
      <h1 className="font-display text-3xl text-charcoal">Rooms are loading slowly</h1>
      <p className="mt-3 text-muted-foreground">Please refresh the page to view our suites.</p>
    </div>
  ),
  component: Rooms,
});

type DisplayRoom = {
  slug: string;
  name: string;
  category: string;
  badge: string;
  rating: number;
  price: number;
  image: string;
  size: string;
  occupancy: string;
  view: string;
  description: string;
  amenities: string[];
};

function fallbackImage(category?: string) {
  return /deluxe/i.test(category ?? "") ? site.images.deluxe : site.images.executive;
}

function mapDbRooms(dbRooms: Awaited<ReturnType<typeof getRooms>>): DisplayRoom[] {
  const seen = new Set<string>();
  const result: DisplayRoom[] = [];
  for (const r of dbRooms as any[]) {
    const key = `${(r.name ?? "").toLowerCase()}|${(r.category ?? "").toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const fallback = rooms.find((s) => s.category?.toLowerCase() === (r.category ?? "").toLowerCase());
    result.push({
      slug: r.id,
      name: r.name ?? "Suite",
      category: r.category ?? "Room",
      badge: r.category ? `${r.category} Suite` : "Signature Stay",
      rating: 4.8,
      price: Number(r.price) || fallback?.price || 0,
      image: (Array.isArray(r.images) && r.images[0]) || fallback?.image || fallbackImage(r.category),
      size: r.floor ? `Floor ${r.floor}` : fallback?.size || "Spacious",
      occupancy: r.capacity ? `${r.capacity} Guest${r.capacity > 1 ? "s" : ""}` : fallback?.occupancy || "2 Adults",
      view: fallback?.view || "City View",
      description: r.description || fallback?.description || "A refined retreat with premium comforts.",
      amenities: (Array.isArray(r.amenities) && r.amenities.length ? r.amenities : fallback?.amenities) || [],
    });
  }
  return result;
}

function Rooms() {
  const { open } = useBooking();
  const { dbRooms, availability } = Route.useLoaderData();
  const mapped = mapDbRooms(dbRooms);
  const list: DisplayRoom[] = mapped.length ? mapped : (rooms as DisplayRoom[]);
  const availByRoom = new Map((availability ?? []).map((a: any) => [a.roomId, a]));
  return (
    <>
      <PageHeader eyebrow="Accommodations" title="Luxury Rooms & Suites" sub="Experience elegance and comfort in our premium accommodations" image={site.images.deluxe} />

      <section className="container-luxe space-y-12 py-24">
        {list.map((r, i) => {
          const avail = availByRoom.get(r.slug) as { available: number; total: number } | undefined;
          const soldOut = avail ? avail.available <= 0 : false;
          return (
          <Reveal key={r.slug} delay={i * 0.05}>
            <div className={`grid grid-cols-1 overflow-hidden rounded-2xl bg-card shadow-luxe lg:grid-cols-2 ${i % 2 ? "lg:[direction:rtl]" : ""}`}>
              <div className="relative h-72 overflow-hidden lg:h-auto [direction:ltr]">
                <AppImage src={r.image} alt={r.name} className="h-full w-full object-cover transition duration-700 hover:scale-105" loading="lazy" />
                <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs uppercase tracking-wider text-ivory">{r.badge}</span>
                {avail && (
                  <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider ${soldOut ? "bg-charcoal/80 text-ivory" : "bg-emerald-600 text-ivory"}`}>
                    {soldOut ? "Fully Booked" : `${avail.available} of ${avail.total} available`}
                  </span>
                )}
              </div>
              <div className="p-8 lg:p-12 [direction:ltr]">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 fill-gold text-gold" /><span className="text-charcoal">{r.rating}</span>
                  <span className="ml-2 text-xs uppercase tracking-[0.2em] text-gold">{r.category}</span>
                </div>
                <h2 className="mt-3 font-display text-4xl text-charcoal">{r.name}</h2>
                <p className="mt-3 text-muted-foreground">{r.description}</p>
                <div className="mt-6 flex flex-wrap gap-6 text-sm text-brown">
                  <span className="flex items-center gap-2"><Maximize className="h-4 w-4 text-gold" />{r.size}</span>
                  <span className="flex items-center gap-2"><Users className="h-4 w-4 text-gold" />{r.occupancy}</span>
                  <span className="flex items-center gap-2"><Eye className="h-4 w-4 text-gold" />{r.view}</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {r.amenities.map((a) => (
                    <span key={a} className="flex items-center gap-2 text-sm text-charcoal"><Check className="h-4 w-4 text-gold" />{a}</span>
                  ))}
                </div>
                <div className="mt-8 flex items-end justify-between">
                  <p className="font-display text-3xl text-gold">₹{r.price}<span className="text-sm text-muted-foreground">/night</span></p>
                  <button onClick={() => open(r.name)} disabled={soldOut} aria-label={`Book ${r.name}`} className="rounded-full bg-charcoal px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition hover:bg-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-charcoal">{soldOut ? "Fully Booked" : "Book Now"}</button>
                </div>
              </div>
            </div>
          </Reveal>
          );
        })}
      </section>

      <section className="bg-beige py-24">
        <div className="container-luxe">
          <SectionHeading center eyebrow="Why Choose Nice Hotel" title="Experience the best in hospitality" />
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseRooms.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.08}>
                <TiltCard className="h-full">
                <div className="h-full rounded-2xl bg-card p-7 text-center shadow-card">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-beige text-gold"><Icon name={w.icon} className="h-6 w-6" /></div>
                  <h3 className="mt-4 font-display text-xl text-charcoal">{w.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{w.text}</p>
                </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Reserve Your Suite Today" sub="Book your stay today and enjoy world-class hospitality at Nice Hotel" image={site.images.executive} />
    </>
  );
}
