import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useRows, useInvalidate, upsertRow, deleteRow, type TableName } from "@/lib/admin/data";
import type { ReactNode } from "react";

export type FieldType = "text" | "textarea" | "number" | "boolean" | "select" | "tags" | "date" | "datetime";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  default?: unknown;
  fullWidth?: boolean;
}

export interface Column {
  name: string;
  label: string;
  render?: (row: any) => ReactNode;
}

interface Props {
  table: TableName;
  columns: Column[];
  fields: Field[];
  orderBy?: string;
  ascending?: boolean;
  searchKeys?: string[];
  rowActions?: (row: any, reload: () => void) => ReactNode;
  canEdit?: boolean;
}

function emptyForm(fields: Field[]) {
  const o: Record<string, unknown> = {};
  for (const f of fields) o[f.name] = f.default ?? (f.type === "boolean" ? false : f.type === "tags" ? [] : "");
  return o;
}

export function ResourceManager({ table, columns, fields, orderBy = "created_at", ascending = false, searchKeys = [], rowActions, canEdit = true }: Props) {
  const { data = [], isLoading } = useRows<any>(table, { orderBy, ascending });
  const invalidate = useInvalidate();
  const reload = () => invalidate(table);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(emptyForm(fields));
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!q) return data;
    const lc = q.toLowerCase();
    return data.filter((row) => searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(lc)));
  }, [data, q, searchKeys]);

  const openNew = () => { setEditing(null); setForm(emptyForm(fields)); setOpen(true); };
  const openEdit = (row: any) => {
    const f: Record<string, unknown> = {};
    for (const fl of fields) {
      const v = row[fl.name];
      f[fl.name] = fl.type === "datetime" && v ? String(v).slice(0, 16) : fl.type === "date" && v ? String(v).slice(0, 10) : v ?? (fl.type === "tags" ? [] : fl.type === "boolean" ? false : "");
    }
    setEditing(row); setForm(f); setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        let v = form[f.name];
        if (f.type === "number") v = v === "" || v === null ? null : Number(v);
        if (f.type === "tags") v = Array.isArray(v) ? v : String(v || "").split(",").map((s) => s.trim()).filter(Boolean);
        if ((f.type === "date" || f.type === "datetime") && v === "") v = null;
        payload[f.name] = v;
      }
      await upsertRow(table, payload, editing?.id);
      toast.success(editing ? "Updated" : "Created");
      setOpen(false); reload();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    try { await deleteRow(table, id); toast.success("Deleted"); reload(); }
    catch (e: any) { toast.error(e.message ?? "Failed to delete"); }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {searchKeys.length > 0 ? (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="pl-9" />
          </div>
        ) : <div />}
        {canEdit && (
          <Button onClick={openNew} className="bg-[#B98A3E] text-white hover:bg-[#a2772f]">
            <Plus className="mr-1.5 h-4 w-4" /> New
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-[#FAFAF8] text-left text-xs uppercase tracking-wider text-muted-foreground">
                {columns.map((c) => <th key={c.name} className="whitespace-nowrap px-4 py-3 font-medium">{c.label}</th>)}
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={columns.length + 1} className="px-4 py-12 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={columns.length + 1} className="px-4 py-12 text-center text-muted-foreground">No records yet.</td></tr>
              )}
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-black/5 last:border-0 hover:bg-[#FAFAF8]">
                  {columns.map((c) => (
                    <td key={c.name} className="px-4 py-3 align-top">{c.render ? c.render(row) : String(row[c.name] ?? "—")}</td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {rowActions?.(row, reload)}
                      {canEdit && (
                        <>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(row)}><Pencil className="h-4 w-4" /></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-[#C62828]"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this record?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-[#C62828] hover:bg-[#a51f1f]" onClick={() => remove(row.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.fullWidth || f.type === "textarea" ? "sm:col-span-2" : ""}>
                <Label className="mb-1.5 block text-xs font-medium">{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea value={String(form[f.name] ?? "")} placeholder={f.placeholder} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                ) : f.type === "boolean" ? (
                  <div className="flex h-10 items-center"><Switch checked={!!form[f.name]} onCheckedChange={(v) => setForm({ ...form, [f.name]: v })} /></div>
                ) : f.type === "select" ? (
                  <Select value={String(form[f.name] ?? "")} onValueChange={(v) => setForm({ ...form, [f.name]: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{(f.options ?? []).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                ) : f.type === "tags" ? (
                  <Input value={Array.isArray(form[f.name]) ? (form[f.name] as string[]).join(", ") : String(form[f.name] ?? "")} placeholder="Comma separated" onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                ) : (
                  <Input type={f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "datetime" ? "datetime-local" : "text"} value={String(form[f.name] ?? "")} placeholder={f.placeholder} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-[#B98A3E] text-white hover:bg-[#a2772f]" onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-[#2E7D32]/10 text-[#2E7D32]", completed: "bg-[#2E7D32]/10 text-[#2E7D32]", approved: "bg-[#2E7D32]/10 text-[#2E7D32]", resolved: "bg-[#2E7D32]/10 text-[#2E7D32]", paid: "bg-[#2E7D32]/10 text-[#2E7D32]", available: "bg-[#2E7D32]/10 text-[#2E7D32]", active: "bg-[#2E7D32]/10 text-[#2E7D32]",
    pending: "bg-[#F9A825]/15 text-[#a37800]", unpaid: "bg-[#F9A825]/15 text-[#a37800]", cleaning: "bg-[#F9A825]/15 text-[#a37800]", reserved: "bg-[#F9A825]/15 text-[#a37800]",
    cancelled: "bg-[#C62828]/10 text-[#C62828]", rejected: "bg-[#C62828]/10 text-[#C62828]", spam: "bg-[#C62828]/10 text-[#C62828]", maintenance: "bg-[#C62828]/10 text-[#C62828]", blocked: "bg-[#C62828]/10 text-[#C62828]", occupied: "bg-[#C62828]/10 text-[#C62828]",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[value] ?? "bg-black/5 text-muted-foreground"}`}>{value}</span>;
}