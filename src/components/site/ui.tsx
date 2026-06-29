import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { useBooking } from "./booking";

export function LuxeButton({
  children, variant = "solid", onClick, type,
}: { children: ReactNode; variant?: "solid" | "outline" | "ghost"; onClick?: () => void; type?: "button" | "submit" }) {
  const base = "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300";
  const styles = {
    solid: "bg-gold text-ivory hover:bg-charcoal",
    outline: "border border-current text-current hover:bg-gold hover:border-gold hover:text-ivory",
    ghost: "bg-ivory text-charcoal hover:bg-gold hover:text-ivory",
  }[variant];
  return <button type={type ?? "button"} onClick={onClick} className={`${base} ${styles}`}>{children}</button>;
}

export function SectionHeading({
  eyebrow, title, sub, center, light,
}: { eyebrow?: string; title: string; sub?: string; center?: boolean; light?: boolean }) {
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className={`mt-3 font-display text-4xl leading-tight md:text-5xl ${light ? "text-ivory" : "text-charcoal"}`}>{title}</h2>
      <div className={`gold-rule mt-5 ${center ? "mx-auto" : ""}`} />
      {sub && <p className={`mt-5 text-base ${light ? "text-ivory/70" : "text-muted-foreground"}`}>{sub}</p>}
    </Reveal>
  );
}

export function PageHeader({ eyebrow, title, sub, image }: { eyebrow: string; title: string; sub: string; image: string }) {
  return (
    <section className="relative flex min-h-[58vh] items-end overflow-hidden">
      <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" loading="eager" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/45 to-charcoal/30" />
      <div className="container-luxe relative z-10 pb-16 pt-32">
        <Reveal>
          <p className="eyebrow text-gold-soft">{eyebrow}</p>
          <h1 className="mt-3 display-hero text-5xl text-ivory md:text-7xl">{title}</h1>
          <div className="gold-rule mt-6" />
          <p className="mt-5 max-w-xl text-lg text-ivory/80">{sub}</p>
        </Reveal>
      </div>
    </section>
  );
}

export function CtaBand({ title, sub, image }: { title: string; sub: string; image: string }) {
  const { open } = useBooking();
  return (
    <section className="relative overflow-hidden py-28">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-charcoal/80" />
      <div className="container-luxe relative z-10 text-center">
        <Reveal>
          <p className="eyebrow text-gold-soft">Your Perfect Stay Begins Here</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl text-ivory md:text-6xl">{title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-ivory/70">{sub}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <LuxeButton onClick={() => open()}>Reserve Your Stay</LuxeButton>
            <Link to="/contact"><LuxeButton variant="outline"><span className="text-ivory">Contact Us</span></LuxeButton></Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
