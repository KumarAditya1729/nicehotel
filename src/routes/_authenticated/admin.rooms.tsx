import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/admin/AdminShell";
import { ResourceManager, StatusBadge, type Field, type Column } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/_authenticated/admin/rooms")({ component: Rooms });

const fields: Field[] = [
  { name: "name", label: "Room Name", type: "text", required: true },
  { name: "room_number", label: "Room Number", type: "text" },
  { name: "category", label: "Category", type: "select", options: ["Executive", "Deluxe", "Suite", "Standard"] },
  { name: "price", label: "Price / night (₹)", type: "number" },
  { name: "weekend_price", label: "Weekend Price (₹)", type: "number" },
  { name: "capacity", label: "Capacity", type: "number", default: 2 },
  { name: "floor", label: "Floor", type: "text" },
  { name: "status", label: "Status", type: "select", options: ["available", "occupied", "reserved", "cleaning", "maintenance", "blocked"], default: "available" },
  { name: "is_active", label: "Active (visible)", type: "boolean", default: true },
  { name: "sort_order", label: "Sort Order", type: "number", default: 0 },
  { name: "amenities", label: "Amenities", type: "tags", fullWidth: true },
  { name: "images", label: "Image URLs", type: "tags", fullWidth: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "seo_title", label: "SEO Title", type: "text" },
  { name: "seo_description", label: "SEO Description", type: "textarea" },
];

const columns: Column[] = [
  { name: "name", label: "Room", render: (r) => <div><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.category || "—"} · #{r.room_number || "—"}</p></div> },
  { name: "price", label: "Price", render: (r) => r.price ? `₹${Number(r.price).toLocaleString("en-IN")}` : "—" },
  { name: "capacity", label: "Cap." },
  { name: "status", label: "Status", render: (r) => <StatusBadge value={r.status} /> },
  { name: "is_active", label: "Active", render: (r) => r.is_active ? "Yes" : "No" },
];

function Rooms() {
  return (
    <div>
      <PageTitle title="Room Management" subtitle="Inventory, pricing, status & SEO" />
      <ResourceManager table="rooms" fields={fields} columns={columns} orderBy="sort_order" ascending searchKeys={["name", "category", "room_number"]} />
    </div>
  );
}