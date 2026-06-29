import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import {
  site, heroStats, rooms, venues, offers, amenities,
} from "@/data/content";
import { Reveal } from "@/components/site/Reveal";
import { Icon } from "@/components/site/Icon";
import { LuxeButton, SectionHeading, CtaBand } from "@/components/site/ui";
import { useBooking } from "@/components/site/booking";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nice Hotel And Restaurant — Luxury Hotel & Fine Dining in Mansa, Punjab" },
      { name: "description", content: "Welcome to Nice Hotel And Restaurant in Mansa, Punjab — 9 luxury rooms, a fine dining restaurant and an elegant party hall. Where luxury meets comfort." },
      { property: "og:title", content: "Nice Hotel And Restaurant" },
      { property: "og:description", content: "Where luxury meets comfort — world-class hospitality in Mansa, Punjab." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function BookingWidget() {
  const { open } = useBooking();
  const field = "w-full rounded-xl border border-border bg-white/60 px-4 py-3 text-sm text-charcoal outline-none focus:border-gold";
  return (
    <Reveal delay={0.3} className="container-luxe relative z-20 -mt-20">
      <div className="glass grid grid-cols-1 gap-3 rounded-2xl p-5 shadow-luxe sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">Check-in
          <input type="date" className={`${field} mt-1`} aria-label="Check-in" /></label>
        <label className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">Check-out
          <input type="date" className={`${field} mt-1`} aria-label="Check-out" /></label>
        <label className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">Guests
          <input type="number" min={1} defaultValue={2} className={`${field} mt-1`} aria-label="Guests" /></label>
        <label className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">Room Type
          <select className={`${field} mt-1`} aria-label="Room type">
            <option>Executive Suite</option><option>Deluxe Suite</option>
          </select></label>
        <button onClick={() => open()}
          className="mt-auto rounded-xl bg-charcoal px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition hover:bg-gold">
          Search Availability
        </button>
      </div>
    </Reveal>
  );
}

function Home() {
  const { open } = useBooking();
  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <motion.img
          src={site.images.dining} alt="Nice Hotel And Restaurant fine dining"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 6, ease: "easeOut" }}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/45 to-charcoal/75" />
        <div className="container-luxe relative z-10 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
            className="eyebrow text-gold-soft">Premium Hospitality · Mansa, Punjab</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 1 }}
            className="mx-auto mt-5 max-w-4xl display-hero text-5xl text-ivory md:text-8xl">
            Nice Hotel<span className="italic text-gold-soft"> &amp; </span>Restaurant
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.9 }}
            className="mx-auto mt-6 max-w-xl text-lg text-ivory/80">
            Premium Accommodation — Luxury Rooms &amp; Suites. Experience refined hospitality where comfort, elegance and unforgettable memories come together.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-9 flex flex-wrap justify-center gap-4">
            <LuxeButton onClick={() => open()}>Book Your Stay</LuxeButton>
            <Link to="/rooms"><LuxeButton variant="outline"><span className="text-ivory">Explore Our Rooms</span></LuxeButton></Link>
          </motion.div>
        </div>
      </section>

      <BookingWidget />

      {/* WELCOME TILES */}
      <section className="container-luxe py-24">
        <SectionHeading center eyebrow="Welcome" title="Welcome to Nice Hotel And Restaurant"
          sub="Where luxury meets comfort — Experience world-class hospitality" />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {heroStats.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="group h-full rounded-2xl border border-border bg-card p-8 text-center shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-luxe">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-beige text-gold transition group-hover:bg-gold group-hover:text-ivory">
                  <Icon name={s.icon} className="h-7 w-7" />
                </div>
                <h3 className="mt-5 font-display text-2xl text-charcoal">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                <span className="mt-4 inline-block rounded-full bg-beige px-4 py-1 text-xs font-medium tracking-wider text-gold">{s.tag}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* EDITORIAL SPLIT */}
      <section className="bg-beige py-24">
        <div className="container-luxe grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Our Story</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-charcoal md:text-5xl">
              Experience Luxury &amp; Comfort in the Heart of Mansa
            </h2>
            <div className="gold-rule mt-5" />
            <p className="mt-6 text-muted-foreground">
              Welcome to Nice Hotel &amp; Restaurant, where elegance meets comfort. Our establishment features 9 beautifully designed luxury rooms, a fine dining restaurant, and a magnificent party hall for weddings, conferences, and special events.
            </p>
            <p className="mt-4 text-muted-foreground">
              Located in the centre of the city, we offer world-class hospitality with personalized service to make your stay truly memorable.
            </p>
            <div className="mt-8"><Link to="/about"><LuxeButton variant="outline"><span className="text-charcoal">Discover More</span></LuxeButton></Link></div>
          </Reveal>
          <Reveal delay={0.2} className="relative">
            <div className="overflow-hidden rounded-2xl shadow-luxe">
              <img src={site.images.executive} alt="Executive suite" className="h-[28rem] w-full object-cover transition duration-700 hover:scale-105" loading="lazy" />
            </div>
            <div className="absolute -bottom-8 -left-6 hidden w-56 overflow-hidden rounded-2xl border-4 border-ivory shadow-luxe sm:block">
              <img src={site.images.hall} alt="Party hall" className="h-40 w-full object-cover" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHY CHOOSE / AMENITIES */}
      <section className="container-luxe py-24">
        <SectionHeading center eyebrow="Why Choose Us" title="Premium Amenities & Services"
          sub="Everything you need for a perfect, effortless stay" />
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3">
          {amenities.map((a, i) => (
            <Reveal key={a.title} delay={i * 0.06}>
              <div className="flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-6 transition hover:border-gold/50 hover:shadow-card">
                <span className="text-gold"><Icon name={a.icon} className="h-6 w-6" /></span>
                <div>
                  <h3 className="font-display text-xl text-charcoal">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ROOMS TEASER */}
      <section className="bg-charcoal py-24">
        <div className="container-luxe">
          <SectionHeading center light eyebrow="Accommodations" title="Luxury Rooms & Suites"
            sub="Choose from our executive and deluxe accommodations" />
          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
            {rooms.map((r, i) => (
              <Reveal key={r.slug} delay={i * 0.12}>
                <div className="group overflow-hidden rounded-2xl bg-ivory shadow-luxe">
                  <div className="relative h-64 overflow-hidden">
                    <img src={r.image} alt={r.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                    <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-xs font-medium uppercase tracking-wider text-ivory">{r.badge}</span>
                    <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-ivory/90 px-3 py-1 text-xs font-medium text-charcoal">
                      <Star className="h-3 w-3 fill-gold text-gold" />{r.rating}
                    </span>
                  </div>
                  <div className="p-7">
                    <h3 className="font-display text-3xl text-charcoal">{r.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
                    <div className="mt-5 flex items-end justify-between">
                      <p className="font-display text-2xl text-gold">₹{r.price}<span className="text-sm text-muted-foreground">/night</span></p>
                      <button onClick={() => open(r.name)} className="text-xs font-medium uppercase tracking-[0.2em] text-charcoal link-underline">Book This Room</button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 text-center"><Link to="/rooms"><LuxeButton>View All Rooms</LuxeButton></Link></div>
        </div>
      </section>

      {/* VENUE TEASER */}
      <section className="container-luxe py-24">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1 overflow-hidden rounded-2xl shadow-luxe">
            <img src={site.images.hall} alt="Grand party hall" className="h-[26rem] w-full object-cover transition duration-700 hover:scale-105" loading="lazy" />
          </Reveal>
          <Reveal delay={0.15} className="order-1 lg:order-2">
            <p className="eyebrow">Grand Event Venues</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-charcoal md:text-5xl">Host Your Special Occasions in Elegance</h2>
            <div className="gold-rule mt-5" />
            <p className="mt-6 text-muted-foreground">
              Elegant ballroom with crystal chandeliers and sophisticated decor. Perfect for kitty parties, birthday celebrations, and social gatherings of 50–100 guests. Our dedicated events team transforms your vision into reality.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Stage", "Sound System", "Chandeliers", "Dance Floor", "Catering"].map((f) => (
                <span key={f} className="rounded-full bg-beige px-4 py-1.5 text-xs text-brown">{f}</span>
              ))}
            </div>
            <div className="mt-8"><Link to="/venue"><LuxeButton variant="outline"><span className="text-charcoal">Explore Venues</span></LuxeButton></Link></div>
          </Reveal>
        </div>
      </section>

      {/* OFFERS */}
      <section className="bg-beige py-24">
        <div className="container-luxe">
          <SectionHeading center eyebrow="Exclusive Offers" title="Special Deals & Packages"
            sub="Curated experiences for our valued guests" />
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {offers.map((o, i) => (
              <Reveal key={o.title} delay={i * 0.08}>
                <div className="group flex h-full flex-col rounded-2xl bg-card p-7 shadow-card transition hover:-translate-y-2 hover:shadow-luxe">
                  <span className="text-xs uppercase tracking-[0.2em] text-gold">{o.tag}</span>
                  <h3 className="mt-3 font-display text-2xl text-charcoal">{o.title}</h3>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{o.text}</p>
                  <button onClick={() => open()} className="mt-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-charcoal">
                    Enquire <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="container-luxe py-24">
        <SectionHeading center eyebrow="Hotel Gallery" title="Explore Our Beautiful Spaces"
          sub="A glimpse into the experiences that await you" />
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { src: site.images.executive, t: "Executive Room", tag: "Featured" },
            { src: site.images.deluxe, t: "Premium Room", tag: "New" },
            { src: site.images.meeting, t: "Meeting Area", tag: "Popular" },
            { src: site.images.dining, t: "Dining Area", tag: "Luxury" },
          ].map((g, i) => (
            <Reveal key={g.t} delay={i * 0.08} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <div className="group relative h-full min-h-[12rem] overflow-hidden rounded-2xl">
                <img src={g.src} alt={g.t} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="absolute bottom-4 left-4 translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="font-display text-xl text-ivory">{g.t}</p>
                  <span className="text-xs uppercase tracking-wider text-gold-soft">{g.tag}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand title="Experience Luxury Today" sub="Book your stay now and enjoy world-class hospitality at Nice Hotel" image={site.images.deluxe} />
    </>
  );
}
