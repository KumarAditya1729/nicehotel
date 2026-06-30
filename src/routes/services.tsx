import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { site, services, offers } from "@/data/content";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/components/site/Icon";
import { PageHeader, SectionHeading, CtaBand } from "@/components/site/ui";
import { breadcrumbLd } from "@/lib/seo";
import { getServices, getOffers } from "@/lib/public.functions";

export const Route = createFileRoute("/services")({
  loader: async () => {
    try {
      const [dbServices, dbOffers] = await Promise.all([getServices(), getOffers()]);
      return { dbServices, dbOffers };
    } catch {
      return { dbServices: [] as Awaited<ReturnType<typeof getServices>>, dbOffers: [] as Awaited<ReturnType<typeof getOffers>> };
    }
  },
  errorComponent: () => (
    <div className="container-luxe py-32 text-center">
      <h1 className="font-display text-3xl text-charcoal">Services are loading slowly</h1>
      <p className="mt-3 text-muted-foreground">Please refresh the page.</p>
    </div>
  ),
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

type GroupedService = { title: string; text: string; icon: string; tags: string[] };

function Services() {
  const { dbServices, dbOffers } = Route.useLoaderData();

  const grouped: Record<string, GroupedService[]> = {};
  if (dbServices.length) {
    for (const s of dbServices) {
      const g = (s as any).group_name || "Services";
      (grouped[g] ??= []).push({
        title: (s as any).title,
        text: (s as any).description ?? "",
        icon: (s as any).icon ?? "sparkles",
        tags: Array.isArray((s as any).tags) ? (s as any).tags : [],
      });
    }
  }
  const serviceGroups = Object.keys(grouped).length
    ? Object.entries(grouped)
    : (Object.entries(services) as [string, GroupedService[]][]);

  const offerList = dbOffers.length
    ? dbOffers.map((o: any) => ({ title: o.title, text: o.description ?? "", tag: o.type ?? "Offer" }))
    : offers;

  return (
    <>
      <PageHeader eyebrow="What We Offer" title="Services & Amenities" sub="World-class hospitality services crafted for your comfort" image={site.images.meeting} />

      <section className="container-luxe space-y-20 py-24">
        {serviceGroups.map(([group, items]) => (
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
            {offerList.map((o, i) => (
              <Reveal key={o.title} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-2xl bg-card p-7 shadow-card">
                  <span className="w-fit rounded-full bg-gold/15 px-3 py-1 text-xs uppercase tracking-wider text-gold capitalize">{o.tag}</span>
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
