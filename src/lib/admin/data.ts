import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminList, adminUpsert, adminDelete, adminUpload } from "@/lib/admin.functions";

export type TableName =
  | "bookings"
  | "rooms"
  | "menu_categories"
  | "menu_items"
  | "offers"
  | "enquiries"
  | "site_settings"
  | "services"
  | "events"
  | "email_logs"
  | "notifications";

export function useRows<T = Record<string, unknown>>(
  table: TableName,
  opts?: { orderBy?: string; ascending?: boolean }
) {
  return useQuery({
    queryKey: [table, opts?.orderBy, opts?.ascending],
    queryFn: async () => {
      const rows = await adminList({ data: { table, orderBy: opts?.orderBy, ascending: opts?.ascending } });
      return (rows ?? []) as T[];
    },
    staleTime: 0,
    refetchInterval: 12000,
    refetchOnWindowFocus: true,
  });
}

export function useInvalidate() {
  const qc = useQueryClient();
  return (table: TableName) => qc.invalidateQueries({ queryKey: [table] });
}

export async function logAudit() {
  /* auditing handled server-side; no-op under shared-password admin */
}

export async function upsertRow(table: TableName, values: Record<string, unknown>, id?: string) {
  await adminUpsert({ data: { table, values, id } });
}

export async function deleteRow(table: TableName, id: string) {
  await adminDelete({ data: { table, id } });
}

export async function setStatus(table: TableName, id: string, patch: Record<string, unknown>) {
  await adminUpsert({ data: { table, values: patch, id } });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadImage(file: File): Promise<string> {
  const base64 = await fileToBase64(file);
  const res = await adminUpload({ data: { filename: file.name, contentType: file.type, base64 } });
  return res.url;
}
