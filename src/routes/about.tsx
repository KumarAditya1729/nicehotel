import { createFileRoute, Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import {
  site, aboutHighlights, aboutStats, aboutStory, amenities, locationPoints,
  diningCopy, diningFeatures, diningHours, hallPackages, ballroomFeatures,
} from "@/data/content";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/components/site/Icon";
import { PageHeader, SectionHeading, CtaBand, LuxeButton } from "@/components/site/ui";
import { breadcrumbLd } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Nice Hotel And Restaurant, Mansa" },
      { name: "description", content: "Discover Nice Hotel & Restaurant in Mansa, Punjab — 9 luxury rooms, fine dining and a grand ballroom for 100 guests. Established 2024." },
      { property: "og:title", content: "About Nice Hotel And Restaurant" },
      { property: "og:url", content: "/about" },
      { property: "og:image", content: site.images.executive },
      { name: "twitter:image", content: site.images.executive },
    ],
    links: [{ rel: "canonical", href: "/about" }],
    scripts: [breadcrumbLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHeader eyebrow="About Us" title="About Nice Hotel" sub="Luxury accommodation, fine dining, and premium events" image={site.images.executive} />

      <section className="container-luxe py-24">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative overflow-hidden rounded-2xl shadow-luxe">
            <img src={site.images.dining} alt="Nice Hotel exterior" className="h-[30rem] w-full object-cover" loading="lazy" />
            <span className="absolute bottom-4 left-4 rounded-full bg-charcoal/80 px-4 py-1.5 text-xs tracking-wider text-ivory">Nice Hotel — Est. 2024</span>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="eyebrow">Our Story</p>
            <h2 className="mt-3 font-display text-4xl text-charcoal md:text-5xl">Experience Luxury &amp; Comfort</h2>
            <div className="gold-rule mt-5" />
            {aboutStory.map((p) => <p key={p} className="mt-5 text-muted-foreground">{p}</p>)}
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {aboutHighlights.map((h, i) => (
            <Reveal key={h.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-border bg-card p-7 shadow-card">
                <span className="text-gold"><Icon name={h.icon} className="h-7 w-7" /></span>
                <h3 className="mt-4 font-display text-xl text-charcoal">{h.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{h.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-charcoal py-16">
        <div className="container-luxe grid grid-cols-2 gap-8 md:grid-cols-4">
          {aboutStats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1} className="text-center">
              <p className="font-display text-5xl text-gold">{s.value}</p>
              <p className="mt-2 text-sm uppercase tracking-wider text-ivory/70">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Events */}
      <section className="container-luxe py-24">
        <SectionHeading eyebrow="Grand Events & Celebrations" title="Host your special occasions in elegance" />
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <Reveal className="overflow-hidden rounded-2xl shadow-luxe">
            <img src={site.images.hall} alt="Grand ballroom" className="h-full min-h-[24rem] w-full object-cover" loading="lazy" />
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex items-center gap-2 text-sm text-gold"><Icon name="building" className="h-5 w-5" /> 100 Guests Capacity</div>
            <h3 className="mt-2 font-display text-3xl text-charcoal">Grand Ballroom</h3>
            <p className="mt-4 text-muted-foreground">
              Elegant ballroom with crystal chandeliers and sophisticated decor. Perfect for parties, kitty parties, and small celebrations. Whether you are hosting an intimate kitty party, a joyous birthday celebration, or a small, cherished wedding reception, our ballroom provides the perfect, versatile canvas. Our dedicated events team is committed to transforming your vision into reality.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {ballroomFeatures.map((f) => <span key={f} className="rounded-full bg-beige px-4 py-1.5 text-xs text-brown">{f}</span>)}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {hallPackages.map((p) => (
                <div key={p.name} className="rounded-xl border border-border bg-card px-4 py-3">
                  <p className="text-sm text-charcoal">{p.name}</p>
                  <p className="font-display text-xl text-gold">{p.price}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Dining */}
      <section className="bg-beige py-24">
        <div className="container-luxe grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Exquisite Dining</p>
            <h3 className="mt-3 font-display text-4xl text-charcoal">A culinary journey like no other</h3>
            <div className="gold-rule mt-5" />
            <p className="mt-5 text-muted-foreground">{diningCopy}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {diningFeatures.map((f) => <span key={f} className="rounded-full bg-card px-4 py-1.5 text-xs text-brown">{f}</span>)}
            </div>
            <div className="mt-6 space-y-2">
              {diningHours.map((h) => (
                <div key={h.meal} className="flex justify-between border-b border-border/60 py-2 text-sm">
                  <span className="text-charcoal">{h.meal}</span><span className="text-muted-foreground">{h.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-7"><Link to="/menu"><LuxeButton>View Menu</LuxeButton></Link></div>
          </Reveal>
          <Reveal delay={0.15} className="overflow-hidden rounded-2xl shadow-luxe">
            <img src={site.images.dining} alt="Fine dining restaurant" className="h-full min-h-[24rem] w-full object-cover" loading="lazy" />
          </Reveal>
        </div>
      </section>

      {/* Amenities */}
      <section className="container-luxe py-24">
        <SectionHeading center eyebrow="Premium Amenities" title="Everything you need for a perfect stay" />
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3">
          {amenities.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.06}>
              <div className="flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-6">
                <span className="text-gold"><Icon name={a.icon} className="h-6 w-6" /></span>
                <div><h3 className="font-display text-lg text-charcoal">{a.title}</h3><p className="mt-1 text-sm text-muted-foreground">{a.text}</p></div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="bg-beige py-20">
        <div className="container-luxe grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <SectionHeading eyebrow="Our Location" title="Conveniently located in the heart of the city" />
            <ul className="mt-8 space-y-3">
              {locationPoints.map((p) => (
                <li key={p} className="flex items-center gap-3 text-charcoal"><Star className="h-4 w-4 fill-gold text-gold" />{p}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.15} className="overflow-hidden rounded-2xl shadow-luxe">
            <iframe title="Map of Nice Hotel And Restaurant, Mansa"
              src="https://www.google.com/maps?q=Mansa,Punjab,151505&output=embed"
              className="h-80 w-full border-0" loading="lazy" />
          </Reveal>
        </div>
      </section>

      <CtaBand title="Ready to Experience Luxury?" sub="Book your stay today and enjoy world-class hospitality at Nice Hotel" image={site.images.hall} />
    </>
  );
}
