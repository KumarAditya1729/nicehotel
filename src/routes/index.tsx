import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import {
  site, rooms, realComfortStats, hospitality, breakfastFeature, curatedPrivileges,
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

      {/* REAL COMFORT — EDITORIAL SPLIT WITH STATS */}
      <section className="container-luxe py-24">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Welcome</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-charcoal md:text-5xl">
              Real Comfort,<br />Warm Service
            </h2>
            <div className="gold-rule mt-5" />
            <p className="mt-6 text-muted-foreground">
              Nice Hotel &amp; Restaurant is where elegance meets comfort. With beautifully designed luxury rooms, a fine dining restaurant and an elegant party hall, we bring world-class hospitality to the heart of Mansa.
            </p>
            <p className="mt-4 text-muted-foreground">
              Located in the centre of the city, we offer personalized service to make your stay truly memorable.
            </p>
            <div className="mt-9 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {realComfortStats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl text-gold md:text-4xl">{s.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
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

      {/* THE MARK OF TRUE HOSPITALITY */}
      <section className="bg-beige py-24">
        <div className="container-luxe">
          <SectionHeading center eyebrow="Why Choose Us" title="The Mark of True Hospitality"
            sub="Everything you need for a perfect, effortless stay" />
          <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
            {hospitality.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.05}>
                <div className="flex h-full items-start gap-4">
                  <span className="text-gold"><Icon name={a.icon} className="h-6 w-6" /></span>
                  <div>
                    <h3 className="font-display text-xl text-charcoal">{a.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1} className="mt-12 border-t border-border/60 pt-10">
            <div className="flex items-start gap-4">
              <span className="text-gold"><Icon name={breakfastFeature.icon} className="h-6 w-6" /></span>
              <div>
                <h3 className="font-display text-xl text-charcoal">{breakfastFeature.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{breakfastFeature.text}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ROOMS TEASER */}
      <section className="container-luxe py-24">
          <SectionHeading center eyebrow="Stay" title="Rooms & Suites"
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
      </section>

      {/* SPACES FOR EVERY GATHERING */}
      <section className="container-luxe py-24">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1 overflow-hidden rounded-2xl shadow-luxe">
            <img src={site.images.hall} alt="Grand party hall" className="h-[26rem] w-full object-cover transition duration-700 hover:scale-105" loading="lazy" />
          </Reveal>
          <Reveal delay={0.15} className="order-1 lg:order-2">
            <p className="eyebrow">Grand Event Venues</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-charcoal md:text-5xl">Spaces for Every Gathering</h2>
            <div className="gold-rule mt-5" />
            <p className="mt-6 text-muted-foreground">
              From intimate functions to lively celebrations, our elegant party hall and flexible spaces are tailored to suit every occasion. Perfect for kitty parties, birthdays and social gatherings of up to 100 guests.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Stage", "Sound System", "Chandeliers", "Dance Floor", "Catering"].map((f) => (
                <span key={f} className="rounded-full bg-beige px-4 py-1.5 text-xs text-brown">{f}</span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/venue"><LuxeButton><span>Explore Venues</span></LuxeButton></Link>
              <button onClick={() => open()}><LuxeButton variant="outline"><span className="text-charcoal">Inquire Now</span></LuxeButton></button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PRIVATE EVENTS DARK BAND */}
      <section className="relative overflow-hidden py-28">
        <img src={site.images.meeting} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-charcoal/80" />
        <div className="container-luxe relative z-10 text-center">
          <Reveal>
            <p className="eyebrow text-gold-soft">Celebrate With Us</p>
            <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl text-ivory md:text-6xl">
              Private Events, Meetings &amp; Family Functions
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-ivory/70">
              Let us host your most cherished moments with impeccable service and elegant spaces.
            </p>
            <div className="mt-9 flex justify-center">
              <button onClick={() => open()}><LuxeButton>Plan Your Event</LuxeButton></button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CURATED PRIVILEGES */}
      <section className="container-luxe py-24">
        <SectionHeading center eyebrow="Exclusive" title="Curated Privileges"
          sub="Thoughtful touches that elevate every stay" />
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {curatedPrivileges.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-card transition hover:-translate-y-2 hover:shadow-luxe">
                <div className="h-48 overflow-hidden">
                  <img src={p.image} alt={p.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <span className="text-xs uppercase tracking-[0.2em] text-gold">{p.tag}</span>
                  <h3 className="mt-3 font-display text-2xl text-charcoal">{p.title}</h3>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{p.text}</p>
                  <button onClick={() => open()} className="mt-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-charcoal">
                    Enquire <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </button>
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
