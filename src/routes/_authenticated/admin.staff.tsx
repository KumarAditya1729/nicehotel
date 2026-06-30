import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/admin/AdminShell";
import { ResourceManager, StatusBadge, type Field, type Column } from "@/components/admin/ResourceManager";
import { useRows } from "@/lib/admin/data";

export const Route = createFileRoute("/_authenticated/admin/staff")({ component: Staff });

const ROLES = ["super_admin", "hotel_manager", "restaurant_manager", "event_manager", "reception", "content_manager", "accountant", "support"];

function Staff() {
  const { data: profiles = [] } = useRows<any>("profiles");

  const fields: Field[] = [
    { name: "user_id", label: "User ID (auth uid)", type: "select", options: profiles.map((p) => ({ value: p.id, label: `${p.full_name || p.email || p.id}` })), required: true, fullWidth: true },
    { name: "role", label: "Role", type: "select", options: ROLES, required: true },
  ];
  const columns: Column[] = [
    { name: "user_id", label: "User", render: (r) => { const p = profiles.find((x) => x.id === r.user_id); return <div><p className="font-medium">{p?.full_name || p?.email || r.user_id}</p><p className="text-xs text-muted-foreground">{p?.email}</p></div>; } },
    { name: "role", label: "Role", render: (r) => <StatusBadge value={String(r.role).replace(/_/g, " ")} /> },
  ];

  return (
    <div>
      <PageTitle title="Staff & Roles" subtitle="Assign role-based access to team members" />
      <ResourceManager table="user_roles" fields={fields} columns={columns} searchKeys={["role"]} />
    </div>
  );
}