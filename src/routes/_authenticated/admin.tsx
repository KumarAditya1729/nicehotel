import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { adminStatus, adminUnlock } from "@/lib/admin.functions";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/nice-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/admin")({ component: Gate });

function Gate() {
  const [state, setState] = useState<"loading" | "locked" | "open">("loading");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    adminStatus().then((r) => setState(r.unlocked ? "open" : "locked")).catch(() => setState("locked"));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const { ok } = await adminUnlock({ data: { password } });
      if (ok) setState("open");
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
        <Loader2 className="h-6 w-6 animate-spin text-[#B98A3E]" />
      </div>
    );
  }

  if (state === "locked") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#161616] px-4">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #B98A3E 0, transparent 45%)" }} />
        <form onSubmit={submit} className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl shadow-2xl">
          <img src={logo.url} alt="Nice Hotel" className="mx-auto h-14 w-14 rounded-xl object-contain" />
          <h1 className="mt-4 font-display text-2xl text-white">Admin Panel</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#B98A3E]">Restricted Access</p>
          <div className="mt-6 text-left">
            <Input
              type="password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="border-white/15 bg-white/5 text-white placeholder:text-white/30"
            />
            {error && <p className="mt-2 text-xs text-red-400">Incorrect password. Please try again.</p>}
          </div>
          <Button type="submit" disabled={submitting} className="mt-5 w-full bg-[#B98A3E] text-white hover:bg-[#a2772f]">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            Unlock
          </Button>
          <a href="/" className="mt-4 inline-block text-[11px] text-white/40 hover:text-white/70">Back to website</a>
        </form>
      </div>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
