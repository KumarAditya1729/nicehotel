import { createFileRoute } from "@tanstack/react-router";
import { Check, X, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { PageTitle } from "@/components/admin/AdminShell";
import { ResourceManager, StatusBadge, type Field, type Column } from "@/components/admin/ResourceManager";
import { setStatus } from "@/lib/admin/data";
import { Button } from "@/components/ui/button";
import { BookingRoomsCell } from "@/components/admin/BookingRooms";

export const Route = createFileRoute("/_authenticated/admin/bookings")({ component: Bookings });

const fields: Field[] = [
  { name: "guest_name", label: "Guest Name", type: "text", required: true },
  { name: "guest_email", label: "Email", type: "text" },
  { name: "guest_phone", label: "Phone", type: "text" },
  { name: "room_type", label: "Room / Type", type: "text" },
  { name: "check_in", label: "Check-in", type: "date" },
  { name: "check_out", label: "Check-out", type: "date" },
  { name: "guests", label: "Guests", type: "number", default: 1 },
  { name: "amount", label: "Amount (₹)", type: "number" },
  { name: "status", label: "Status", type: "select", options: ["pending", "confirmed", "checked_in", "checked_out", "completed", "cancelled"], default: "pending" },
  { name: "payment_status", label: "Payment", type: "select", options: ["unpaid", "paid", "refunded"], default: "unpaid" },
  { name: "source", label: "Source", type: "select", options: ["website", "walk-in", "phone", "online"], default: "website" },
  { name: "special_requests", label: "Special Requests", type: "textarea" },
  { name: "notes", label: "Internal Notes", type: "textarea" },
];

const columns: Column[] = [
  { name: "guest_name", label: "Guest", render: (r) => <div><p className="font-medium">{r.guest_name}</p><p className="text-xs text-muted-foreground">{r.guest_phone || r.guest_email || "—"}</p></div> },
  { name: "room_type", label: "Rooms", render: (r) => <BookingRoomsCell bookingId={r.id} fallback={r.room_type} /> },
  { name: "check_in", label: "Dates", render: (r) => <span className="text-xs">{r.check_in || "—"} → {r.check_out || "—"}</span> },
  { name: "amount", label: "Amount", render: (r) => r.amount ? `₹${Number(r.amount).toLocaleString("en-IN")}` : "—" },
  { name: "payment_status", label: "Payment", render: (r) => <StatusBadge value={r.payment_status} /> },
  { name: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
  { name: "source", label: "Source", render: (r) => <span className="text-xs capitalize">{r.source}</span> },
];

function Bookings() {
  const quick = async (id: string, status: string, reload: () => void) => {
    try { await setStatus("bookings", id, { status }); toast.success(`Marked ${status}`); reload(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <div>
      <PageTitle title="Booking Management" subtitle="Walk-ins, online & website reservations" />
      <ResourceManager
        table="bookings" fields={fields} columns={columns}
        searchKeys={["guest_name", "guest_email", "guest_phone", "room_type"]}
        rowActions={(row, reload) => (
          <>
            {row.status === "pending" && (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-[#2E7D32]" title="Confirm" onClick={() => quick(row.id, "confirmed", reload)}><Check className="h-4 w-4" /></Button>
            )}
            {(row.status === "confirmed" || row.status === "pending") && (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-[#1565C0]" title="Check in" onClick={() => quick(row.id, "checked_in", reload)}><LogIn className="h-4 w-4" /></Button>
            )}
            {row.status === "checked_in" && (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-[#6A1B9A]" title="Check out" onClick={() => quick(row.id, "checked_out", reload)}><LogOut className="h-4 w-4" /></Button>
            )}
            {row.status !== "cancelled" && row.status !== "checked_out" && row.status !== "completed" && (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-[#C62828]" title="Cancel" onClick={() => quick(row.id, "cancelled", reload)}><X className="h-4 w-4" /></Button>
            )}
          </>
        )}
      />
    </div>
  );
}