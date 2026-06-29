import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { nav, site } from "@/data/content";
import logo from "@/assets/nice-logo.png.asset.json";
import { useBooking } from "./booking";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { open } = useBooking();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isHome = path === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !isHome;
  const textColor = solid ? "text-charcoal" : "text-ivory";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${
          solid ? "bg-ivory/92 shadow-sm backdrop-blur-md py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container-luxe flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label={site.name}>
            <img src={logo.url} alt={`${site.name} logo`} className="h-11 w-11 rounded-full object-contain" />
            <span className="hidden sm:block leading-tight">
              <span className={`block font-display text-lg ${textColor}`}>The Nice</span>
              <span className={`block text-[0.6rem] uppercase tracking-[0.3em] ${solid ? "text-gold" : "text-gold-soft"}`}>
                Hotel &amp; Restaurant
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`link-underline text-sm tracking-wide transition-colors ${textColor} hover:text-gold`}
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => open()}
              className="hidden rounded-full bg-gold px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition hover:bg-charcoal sm:block"
            >
              Book Now
            </button>
            <button
              className={`lg:hidden ${textColor}`}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[110] bg-charcoal text-ivory lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="container-luxe flex items-center justify-between py-6">
              <span className="font-display text-2xl">The Nice</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="h-7 w-7" />
              </button>
            </div>
            <nav className="container-luxe mt-10 flex flex-col gap-2" aria-label="Mobile">
              {nav.map((n, i) => (
                <motion.div
                  key={n.to}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    to={n.to}
                    onClick={() => setMobileOpen(false)}
                    className="block border-b border-ivory/10 py-4 font-display text-3xl"
                  >
                    {n.label}
                  </Link>
                </motion.div>
              ))}
              <button
                onClick={() => { setMobileOpen(false); open(); }}
                className="mt-8 rounded-full bg-gold px-6 py-4 text-sm font-medium uppercase tracking-[0.2em] text-ivory"
              >
                Book Now
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
