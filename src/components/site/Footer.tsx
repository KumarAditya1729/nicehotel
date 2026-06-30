import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, MapPin, Phone, Mail, Clock } from "lucide-react";
import { nav, site } from "@/data/content";
import logo from "@/assets/nice-logo.png.asset.json";

export function Footer() {
  return (
    <footer className="bg-charcoal text-ivory/80">
      <div className="container-luxe grid grid-cols-1 gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <img src={logo.url} alt={`${site.name} logo`} className="h-12 w-12 rounded-full object-contain" />
            <span className="font-display text-2xl text-ivory">The Nice</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ivory/60">{site.tagline}</p>
          <div className="mt-5 flex gap-3">
            <a href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 transition hover:border-gold hover:text-gold">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={site.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 transition hover:border-gold hover:text-gold">
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-gold">Quick Links</h4>
          <ul className="mt-5 space-y-3 text-sm">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="text-ivory/70 transition hover:text-gold">{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-gold">Contact Us</h4>
          <ul className="mt-5 space-y-4 text-sm text-ivory/70">
            <li className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-gold" />{site.address}</li>
            <li className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-gold" /><a href={`tel:${site.phoneRaw}`} className="hover:text-gold">{site.phone}</a></li>
            <li className="flex gap-3"><Mail className="h-4 w-4 shrink-0 text-gold" /><a href={`mailto:${site.email}`} className="break-all hover:text-gold">{site.email}</a></li>
            <li className="flex gap-3"><Clock className="h-4 w-4 shrink-0 text-gold" />{site.hours}</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.25em] text-gold">Newsletter</h4>
          <p className="mt-5 text-sm text-ivory/60">Subscribe to get updates on new arrivals and special offers.</p>
          <form className="mt-4 flex overflow-hidden rounded-full border border-ivory/20" onSubmit={(e) => e.preventDefault()}>
            <input type="email" required placeholder="Your email" aria-label="Email for newsletter"
              className="w-full bg-transparent px-4 py-2.5 text-sm text-ivory placeholder:text-ivory/40 outline-none" />
            <button className="bg-gold px-5 text-xs font-medium uppercase tracking-wider text-ivory">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container-luxe flex flex-col items-center justify-between gap-3 py-6 text-xs text-ivory/50 sm:flex-row">
          <p>© 2026 Nice Hotel &amp; Restaurant. All Rights Reserved.</p>
          <p>Crafted with ♥ for premium hospitality</p>
          <Link to="/admin" className="hover:text-gold">Admin Login</Link>
        </div>
      </div>
    </footer>
  );
}
