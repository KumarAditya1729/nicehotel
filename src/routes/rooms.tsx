import { createFileRoute } from "@tanstack/react-router";
import { Star, Maximize, Users, Eye, Check } from "lucide-react";
import { site, rooms, whyChooseRooms } from "@/data/content";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/components/site/Icon";
import { PageHeader, SectionHeading, CtaBand } from "@/components/site/ui";
import { useBooking } from "@/components/site/booking";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Luxury Rooms & Suites — Nice Hotel And Restaurant, Mansa" },
      { name: "description", content: "Executive and Deluxe suites at Nice Hotel And Restaurant, Mansa. Premium amenities, king beds, smart TVs and city views from ₹1500/night." },
      { property: "og:title", content: "Luxury Rooms & Suites" },
      { property: "og:url", content: "/rooms" },
      { property: "og:image", content: site.images.executive },
    ],
    links: [{ rel: "canonical", href: "/rooms" }],
  }),
  component: Rooms,
});

function Rooms() {
  const { open } = useBooking();
  return (
    <>
      <PageHeader eyebrow="Accommodations" title="Luxury Rooms & Suites" sub="Experience elegance and comfort in our premium accommodations" image={site.images.deluxe} />

      <section className="container-luxe space-y-12 py-24">
        {rooms.map((r, i) => (
          <Reveal key={r.slug} delay={i * 0.05}>
            <div className={`grid grid-cols-1 overflow-hidden rounded-2xl bg-card shadow-luxe lg:grid-cols-2 ${i % 2 ? "lg:[direction:rtl]" : ""}`}>
              <div className="relative h-72 overflow-hidden lg:h-auto [direction:ltr]">
                <img src={r.image} alt={r.name} className="h-full w-full object-cover transition duration-700 hover:scale-105" loading="lazy" />
                <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs uppercase tracking-wider text-ivory">{r.badge}</span>
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
                  <button onClick={() => open(r.name)} className="rounded-full bg-charcoal px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition hover:bg-gold">Book Now</button>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="bg-beige py-24">
        <div className="container-luxe">
          <SectionHeading center eyebrow="Why Choose Nice Hotel" title="Experience the best in hospitality" />
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseRooms.map((w, i) => (
              <Reveal key={w.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl bg-card p-7 text-center shadow-card">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-beige text-gold"><Icon name={w.icon} className="h-6 w-6" /></div>
                  <h3 className="mt-4 font-display text-xl text-charcoal">{w.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{w.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Reserve Your Suite Today" sub="Book your stay today and enjoy world-class hospitality at Nice Hotel" image={site.images.executive} />
    </>
  );
}
