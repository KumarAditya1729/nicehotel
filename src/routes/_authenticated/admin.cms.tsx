import { AppImage } from "@/components/site/AppImage";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageTitle } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { adminSettingsList, adminSettingSave, adminSettingDelete } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/cms")({ component: Cms });

type Block = { key: string; value: { label?: string; type?: "text" | "image"; value?: string } };

function Cms() {
  const [rows, setRows] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form, setForm] = useState<{ key: string; label: string; type: "text" | "image"; value: string }>({ key: "", label: "", type: "text", value: "" });

  const load = async () => {
    setLoading(true);
    try { setRows((await adminSettingsList()) as Block[]); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditingKey(null); setForm({ key: "", label: "", type: "text", value: "" }); setOpen(true); };
  const openEdit = (b: Block) => {
    setEditingKey(b.key);
    setForm({ key: b.key, label: b.value?.label ?? "", type: b.value?.type ?? "text", value: b.value?.value ?? "" });
    setOpen(true);
  };

  const save = async () => {
    if (!form.key.trim()) { toast.error("Key is required"); return; }
    setSaving(true);
    try {
      await adminSettingSave({ data: { key: form.key.trim(), value: { label: form.label, type: form.type, value: form.value } } });
      toast.success("Saved");
      setOpen(false); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const remove = async (key: string) => {
    try { await adminSettingDelete({ data: { key } }); toast.success("Deleted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div>
      <PageTitle title="Site CMS" subtitle="Create & manage reusable site content blocks — text & images, saved instantly" />
      <div className="mb-4 flex justify-end">
        <Button onClick={openNew} className="bg-[#B98A3E] text-white hover:bg-[#a2772f]"><Plus className="mr-1.5 h-4 w-4" /> New Block</Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-[#FAFAF8] text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Content Block</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground"><FileText className="mx-auto mb-2 h-5 w-5" />No content blocks yet. Create your first one.</td></tr>}
            {rows.map((b) => (
              <tr key={b.key} className="border-b border-black/5 last:border-0 hover:bg-[#FAFAF8]">
                <td className="px-4 py-3"><p className="font-medium">{b.value?.label || b.key}</p><p className="text-xs text-muted-foreground">{b.key}</p></td>
                <td className="px-4 py-3 capitalize">{b.value?.type ?? "text"}</td>
                <td className="px-4 py-3">
                  {b.value?.type === "image" && b.value?.value
                    ? <AppImage src={b.value.value} alt={b.key} className="h-12 w-16 rounded object-cover" />
                    : <span className="line-clamp-1 max-w-xs text-xs text-muted-foreground">{b.value?.value || "—"}</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8 text-[#C62828]"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Delete this block?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-[#C62828] hover:bg-[#a51f1f]" onClick={() => remove(b.key)}>Delete</AlertDialogAction></AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingKey ? "Edit" : "New"} content block</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Key (unique id)</Label>
              <Input value={form.key} disabled={!!editingKey} placeholder="e.g. home_hero_title" onChange={(e) => setForm({ ...form, key: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Label</Label>
              <Input value={form.label} placeholder="Friendly name" onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "text" | "image", value: "" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="text">Text</SelectItem><SelectItem value="image">Image</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium">Value</Label>
              {form.type === "image"
                ? <ImageUpload value={form.value} onChange={(url) => setForm({ ...form, value: url })} />
                : <Textarea value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="bg-[#B98A3E] text-white hover:bg-[#a2772f]" onClick={save} disabled={saving}>{saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
