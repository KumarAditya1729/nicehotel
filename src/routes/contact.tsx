import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Instagram, Send } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { sendContactEmail } from "@/lib/email.functions";
import { site } from "@/data/content";
import { Reveal } from "@/components/site/Reveal";
import { PageHeader } from "@/components/site/ui";
import { breadcrumbLd } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Nice Hotel And Restaurant, Mansa, Punjab" },
      {
        name: "description",
        content:
          "Contact Nice Hotel And Restaurant, Near Chugli Ghar, Mansa 151505. Call +91 9216400005 or email nicehotelandrestaurant@gmail.com for bookings.",
      },
      { property: "og:title", content: "Contact Nice Hotel And Restaurant" },
      { property: "og:url", content: "/contact" },
      { property: "og:image", content: site.images.dining },
      { name: "twitter:image", content: site.images.dining },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
    scripts: [
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ]),
    ],
  }),
  component: Contact,
});

const details = (s = site) => [
  {
    icon: MapPin,
    label: "Address",
    value: s.address,
    href: "https://www.google.com/maps/place/Nice+Hotel+and+Restaurant/@29.9869986,75.3965777,17z/data=!3m1!4b1!4m6!3m5!1s0x39111ed233e52a9d:0x4b9e1af1e64ace0a!8m2!3d29.9869986!4d75.3965777!16s%2Fg%2F11b7tz5qzr?entry=ttu&g_ep=EgoyMDI2MDYyOC4wIKXMDSoASAFQAw%3D%3D",
  },
  { icon: Phone, label: "Phone", value: s.phone, href: `tel:${s.phoneRaw}` },
  { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
  { icon: Clock, label: "Hours", value: s.hours },
  { icon: Instagram, label: "Instagram", value: "@nice_hotel_and_resturant", href: s.instagram },
];

function Contact() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const submitContact = useServerFn(sendContactEmail);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    setSending(true);
    try {
      await submitContact({
        data: {
          name: String(fd.get("name") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          message: String(fd.get("message") || ""),
        },
      });
      setSent(true);
      form.reset();
      toast.success("Thank you! A confirmation email is on its way.");
    } catch {
      toast.error("Could not send your message", {
        description: `Please call us at ${site.phone}.`,
      });
    } finally {
      setSending(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Get In Touch"
        title="Contact Us"
        sub="We'd love to hear from you — reach out anytime"
        image={site.images.hall}
      />

      <section className="container-luxe grid grid-cols-1 gap-12 py-24 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-3xl text-charcoal">Reach Us</h2>
          <div className="gold-rule mt-4" />
          <div className="mt-8 space-y-5">
            {details().map((d) => (
              <div key={d.label} className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-beige text-gold">
                  <d.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {d.label}
                  </p>
                  {d.href ? (
                    <a
                      href={d.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-charcoal transition hover:text-gold"
                    >
                      {d.value}
                    </a>
                  ) : (
                    <p className="text-charcoal">{d.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl shadow-luxe">
            <iframe
              title="Map"
              src="https://www.google.com/maps?q=Nice+Hotel+and+Restaurant,+Mansa,+Punjab&output=embed"
              className="h-72 w-full border-0"
              loading="lazy"
            />
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-border bg-card p-8 shadow-card"
          >
            <h2 className="font-display text-3xl text-charcoal">Send a Message</h2>
            <div className="gold-rule mt-4" />
            <div className="mt-6 space-y-4">
              {[
                ["Name", "text", "name", "name"],
                ["Email", "email", "email", "email"],
                ["Phone", "tel", "tel", "phone"],
              ].map(([l, t, ac, nm]) => (
                <div key={l}>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">
                    {l}
                  </label>
                  <input
                    required
                    name={nm as string}
                    type={t as string}
                    autoComplete={ac as string}
                    className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-sm outline-none focus:border-gold"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Message
                </label>
                <textarea
                  required
                  name="message"
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-border bg-white/70 px-4 py-3 text-sm outline-none focus:border-gold"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-charcoal py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition hover:bg-gold disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending…" : sent ? "Message Sent" : "Send Message"}
              </button>
            </div>
          </form>
        </Reveal>
      </section>
    </>
  );
}
