import { AppImage } from "@/components/site/AppImage";
import { useEffect, useState } from "react";
import { X, Tag } from "lucide-react";
import { getOffers } from "@/lib/public.functions";

type Offer = { id: string; title: string; description?: string | null; code?: string | null; discount?: string | null; image?: string | null };

export function OffersPopup() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("offers_popup_seen")) return;
    let active = true;
    getOffers()
      .then((data) => {
        if (!active || !data || data.length === 0) return;
        setOffers(data as Offer[]);
        setOpen(true);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const close = () => {
    setOpen(false);
    if (typeof window !== "undefined") sessionStorage.setItem("offers_popup_seen", "1");
  };

  if (!open || offers.length === 0) return null;
  const main = offers[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={close}>
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-ivory shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={close} aria-label="Close offers" className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60">
          <X className="h-4 w-4" />
        </button>
        {main.image && (
          <AppImage src={main.image} alt={main.title} className="h-44 w-full object-cover" />
        )}
        <div className="p-7 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-[0.3em] text-gold"><Tag className="h-3.5 w-3.5" /> Special Offers</p>
          <h2 className="mt-2 font-display text-3xl text-charcoal">{main.title}</h2>
          {main.description && <p className="mt-2 text-sm text-muted-foreground">{main.description}</p>}
          {main.discount && <p className="mt-3 font-display text-2xl text-gold">{main.discount}</p>}
          {main.code && (
            <div className="mt-4 inline-block rounded-lg border border-dashed border-gold/60 bg-gold/10 px-4 py-2 text-sm font-medium tracking-wider text-charcoal">
              Code: <span className="font-display text-gold">{main.code}</span>
            </div>
          )}
          {offers.length > 1 && (
            <div className="mt-5 space-y-2 border-t border-black/5 pt-4 text-left">
              {offers.slice(1, 4).map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal">{o.title}</span>
                  {o.discount && <span className="font-medium text-gold">{o.discount}</span>}
                </div>
              ))}
            </div>
          )}
          <button onClick={close} className="mt-6 w-full rounded-full bg-charcoal px-7 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ivory transition hover:bg-gold">
            Explore Now
          </button>
        </div>
      </div>
    </div>
  );
}
