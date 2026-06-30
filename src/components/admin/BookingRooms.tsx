import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BedDouble, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { adminBookingRooms, adminBookingRoomUpdate } from "@/lib/admin.functions";

type RoomLine = {
  id: string; room_type: string; quantity: number; adults: number; children: number;
  extra_bed: boolean; price: number; room_number: string | null; notes: string | null;
};

export function BookingRoomsCell({ bookingId, fallback }: { bookingId: string; fallback?: string }) {
  const [rows, setRows] = useState<RoomLine[] | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminBookingRooms({ data: { bookingId } })
      .then((r) => setRows(r as unknown as RoomLine[]))
      .catch(() => setRows([]));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [bookingId]);

  const summary = rows && rows.length
    ? rows.map((r) => `${r.room_type} ×${r.quantity}`).join(", ")
    : (fallback || "—");

  const saveNumber = async (id: string, room_number: string) => {
    setSaving(true);
    try {
      await adminBookingRoomUpdate({ data: { id, values: { room_number } } });
      toast.success("Room number saved");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) load(); }}>
      <DialogTrigger asChild>
        <button className="text-left text-xs hover:text-gold" title="Manage rooms">
          <span className="line-clamp-2">{summary}</span>
          {rows && rows.length > 1 && <span className="text-[10px] text-muted-foreground"> ({rows.length} types)</span>}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><BedDouble className="h-4 w-4" /> Rooms in this booking</DialogTitle></DialogHeader>
        {!rows ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : rows.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">This is a single-room booking ({fallback || "—"}). No detailed room lines recorded.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.room_type} ×{r.quantity}</span>
                  <span className="text-gold">₹{Number(r.price).toLocaleString("en-IN")}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.adults} adult{r.adults > 1 ? "s" : ""}{r.children ? `, ${r.children} child` : ""}{r.extra_bed ? ", extra bed" : ""}
                  {r.notes ? ` · ${r.notes}` : ""}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Room no.</label>
                  <input
                    defaultValue={r.room_number ?? ""}
                    onBlur={(e) => e.target.value !== (r.room_number ?? "") && saveNumber(r.id, e.target.value)}
                    placeholder="e.g. 204"
                    className="w-28 rounded border px-2 py-1 text-xs"
                  />
                </div>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground">{saving ? "Saving…" : "Room numbers save automatically when you click away."}</p>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => window.print()}>Print</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
