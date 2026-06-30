import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { site, services, offers } from "@/data/content";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/components/site/Icon";
import { PageHeader, SectionHeading, CtaBand } from "@/components/site/ui";
import { breadcrumbLd } from "@/lib/seo";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services & Amenities — Nice Hotel And Restaurant, Mansa" },
      { name: "description", content: "Premium services at Nice Hotel And Restaurant, Mansa — luxury rooms, event venues, fine dining, valet parking, free WiFi, housekeeping and 24/7 concierge." },
      { property: "og:title", content: "Services & Amenities" },
      { property: "og:url", content: "/services" },
      { property: "og:image", content: site.images.meeting },
      { name: "twitter:image", content: site.images.meeting },
    ],
    links: [{ rel: "canonical", href: "/services" }],
    scripts: [breadcrumbLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])],
  }),
  component: Services,
});

function Services() {
  return (
    <>
      <PageHeader eyebrow="What We Offer" title="Services & Amenities" sub="World-class hospitality services crafted for your comfort" image={site.images.meeting} />

      <section className="container-luxe space-y-20 py-24">
        {Object.entries(services).map(([group, items]) => (
          <div key={group}>
            <Reveal><SectionHeading eyebrow="Premium Offering" title={group} /></Reveal>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {items.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.08}>
                  <div className="flex h-full gap-5 rounded-2xl border border-border bg-card p-7 shadow-card transition hover:shadow-luxe">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-beige text-gold"><Icon name={s.icon} className="h-6 w-6" /></span>
                    <div>
                      <h3 className="font-display text-2xl text-charcoal">{s.title}</h3>
                      <p className="mt-1 text-muted-foreground">{s.text}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {s.tags.map((t) => <span key={t} className="flex items-center gap-1.5 rounded-full bg-beige px-3 py-1 text-xs text-brown"><Check className="h-3 w-3 text-gold" />{t}</span>)}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="bg-beige py-24">
        <div className="container-luxe">
          <SectionHeading center eyebrow="Special Offers" title="Exclusive packages for a memorable stay" />
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {offers.map((o, i) => (
              <Reveal key={o.title} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-2xl bg-card p-7 shadow-card">
                  <span className="w-fit rounded-full bg-gold/15 px-3 py-1 text-xs uppercase tracking-wider text-gold">{o.tag}</span>
                  <h3 className="mt-4 font-display text-2xl text-charcoal">{o.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{o.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Experience Premium Hospitality" sub="Book your stay now and enjoy world-class hospitality at Nice Hotel" image={site.images.executive} />
    </>
  );
}
