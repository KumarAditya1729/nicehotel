import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/admin/AdminShell";
import { ResourceManager, StatusBadge, type Field, type Column } from "@/components/admin/ResourceManager";

export const Route = createFileRoute("/_authenticated/admin/audit")({ component: Audit });

const columns: Column[] = [
  { name: "action", label: "Action", render: (r) => <StatusBadge value={r.action} /> },
  { name: "entity", label: "Entity" },
  { name: "entity_id", label: "Record", render: (r) => <span className="text-xs text-muted-foreground">{r.entity_id?.slice(0, 8) || "—"}</span> },
  { name: "user_id", label: "User", render: (r) => <span className="text-xs text-muted-foreground">{r.user_id?.slice(0, 8)}</span> },
  { name: "created_at", label: "When", render: (r) => <span className="text-xs">{r.created_at ? new Date(r.created_at).toLocaleString() : "—"}</span> },
];

function Audit() {
  return (
    <div>
      <PageTitle title="Audit Logs" subtitle="Every change is tracked — who, what & when" />
      <ResourceManager table="audit_logs" fields={[] as Field[]} columns={columns} canEdit={false} searchKeys={["action", "entity"]} />
    </div>
  );
}