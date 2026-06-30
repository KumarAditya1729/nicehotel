import { AppImage } from "@/components/site/AppImage";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Users, Maximize, MapPin, Check } from "lucide-react";
import { site, venues, whyBookVenue, hallPackages } from "@/data/content";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/components/site/Icon";
import { PageHeader, SectionHeading, CtaBand } from "@/components/site/ui";
import { VenueBookingDialog } from "@/components/site/VenueBookingDialog";
import { breadcrumbLd } from "@/lib/seo";
import { getEvents } from "@/lib/public.functions";

export const Route = createFileRoute("/venue")({
  loader: async () => {
    try {
      return { dbEvents: await getEvents() };
    } catch {
      return { dbEvents: [] as Awaited<ReturnType<typeof getEvents>> };
    }
  },
  errorComponent: () => (
    <div className="container-luxe py-32 text-center">
      <h1 className="font-display text-3xl text-charcoal">Venues are loading slowly</h1>
      <p className="mt-3 text-muted-foreground">Please refresh the page.</p>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Party & Event Halls — Nice Hotel And Restaurant, Mansa" },
      { name: "description", content: "Elegant party hall and meeting room for weddings, kitty parties and corporate events in Mansa. Capacity up to 100 guests with catering and decor." },
      { property: "og:title", content: "Party & Event Halls" },
      { property: "og:url", content: "/venue" },
      { property: "og:image", content: site.images.hall },
      { name: "twitter:image", content: site.images.hall },
    ],
    links: [{ rel: "canonical", href: "/venue" }],
    scripts: [breadcrumbLd([{ name: "Home", path: "/" }, { name: "Venue", path: "/venue" }])],
  }),
  component: Venue,
});

function Venue() {
  const [bookingVenue, setBookingVenue] = useState<string | null>(null);
  const { dbEvents } = Route.useLoaderData();
  type VenueCard = { slug: string; name: string; sub: string; badge: string; rating: number; capacity: string; size: string; floor: string; image: string; comingSoon: boolean; description: string; amenities: string[] };
  const venueList: VenueCard[] = dbEvents.length
    ? dbEvents.map((v: any) => {
        const match = venues.find(
          (s) => s.name.toLowerCase() === String(v.name ?? "").toLowerCase(),
        );
        return {
        slug: v.id as string,
        name: v.name as string,
        sub: (v.subtitle as string) ?? "",
        badge: (v.badge as string) ?? "",
        rating: 4.8,
        capacity: (v.capacity as string) ?? "",
        size: (v.size as string) ?? "",
        floor: (v.floor as string) ?? "",
        image: (v.image as string) || match?.image || site.images.hall,
        comingSoon: Boolean(v.coming_soon),
        description: (v.description as string) ?? "",
        amenities: Array.isArray(v.amenities) ? (v.amenities as string[]) : [],
        };
      })
    : venues;
  return (
    <>
      <PageHeader eyebrow="Events" title="Party & Event Halls" sub="Elegant venues for your special occasions" image={site.images.hall} />

      <section className="container-luxe grid grid-cols-1 gap-8 py-24 lg:grid-cols-3">
        {venueList.map((v, i) => (
          <Reveal key={v.slug} delay={i * 0.1}>
            <div className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-card transition hover:shadow-luxe">
              <div className="relative h-56 overflow-hidden">
                <AppImage src={v.image} alt={v.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs uppercase tracking-wider text-ivory ${v.comingSoon ? "bg-brown" : "bg-gold"}`}>{v.badge}</span>
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-ivory/90 px-3 py-1 text-xs text-charcoal"><Star className="h-3 w-3 fill-gold text-gold" />{v.rating}</span>
              </div>
              <div className="flex flex-1 flex-col p-7">
                <span className="text-xs uppercase tracking-[0.2em] text-gold">{v.sub}</span>
                <h3 className="mt-1 font-display text-2xl text-charcoal">{v.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
                <div className="mt-4 space-y-2 text-sm text-brown">
                  <span className="flex items-center gap-2"><Users className="h-4 w-4 text-gold" />{v.capacity}</span>
                  <span className="flex items-center gap-2"><Maximize className="h-4 w-4 text-gold" />{v.size}</span>
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" />{v.floor}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {v.amenities.slice(0, 4).map((a) => <span key={a} className="rounded-full bg-beige px-3 py-1 text-xs text-brown">{a}</span>)}
                </div>
                <div className="mt-auto pt-6">
                  <button
                    disabled={v.comingSoon}
                    onClick={() => setBookingVenue(v.name)}
                    className={`w-full rounded-full px-6 py-3 text-xs font-medium uppercase tracking-[0.2em] transition ${v.comingSoon ? "cursor-not-allowed bg-beige text-muted-foreground" : "bg-charcoal text-ivory hover:bg-gold"}`}
                  >
                    {v.comingSoon ? "Coming Soon" : "Book This Venue"}
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="bg-beige py-20">
        <div className="container-luxe">
          <SectionHeading center eyebrow="Hall Packages" title="Transparent, all-inclusive pricing" />
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {hallPackages.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08}>
                <div className="rounded-2xl bg-card p-7 text-center shadow-card">
                  <p className="text-sm text-charcoal">{p.name}</p>
                  <p className="mt-2 font-display text-3xl text-gold">{p.price}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-luxe py-24">
        <SectionHeading center eyebrow="Why Book With Us" title="Experience unforgettable events at Nice Hotel" />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyBookVenue.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-border bg-card p-7 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-beige text-gold"><Icon name={w.icon} className="h-6 w-6" /></div>
                <h3 className="mt-4 font-display text-xl text-charcoal">{w.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{w.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand title="Plan Your Perfect Event" sub="Book your stay now and enjoy world-class hospitality at Nice Hotel" image={site.images.meeting} />
      <VenueBookingDialog venue={bookingVenue} onClose={() => setBookingVenue(null)} />
    </>
  );
}
