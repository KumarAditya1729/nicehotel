import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  component: () => (
    <AdminAuthProvider>
      <Gate />
    </AdminAuthProvider>
  ),
});

function Gate() {
  const { loading, isStaff, signOut } = useAdminAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
        <Loader2 className="h-6 w-6 animate-spin text-[#B98A3E]" />
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAFAF8] px-4 text-center">
        <ShieldAlert className="h-10 w-10 text-[#C62828]" />
        <div>
          <h1 className="font-display text-2xl text-[#161616]">No admin access</h1>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Your account is signed in but has no staff role assigned. Contact a Super Admin to grant access.</p>
        </div>
        <Button variant="outline" onClick={async () => { await signOut(); navigate({ to: "/auth", replace: true }); }}>Sign out</Button>
      </div>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}