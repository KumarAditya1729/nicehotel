import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Hotel } from "lucide-react";
import logo from "@/assets/nice-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin Login — Nice Hotel & Restaurant" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/admin", replace: true }); });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: "/admin", replace: true });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/admin" } });
        if (error) throw error;
        toast.success("Account created — signing you in");
        navigate({ to: "/admin", replace: true });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
        if (error) throw error;
        toast.success("Password reset link sent to your email");
        setMode("signin");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#161616] px-4">
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #B98A3E 0, transparent 45%)" }} />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-7 text-center">
          <img src={logo.url} alt="Nice Hotel" className="mx-auto h-14 w-14 rounded-xl object-contain" />
          <h1 className="mt-4 font-display text-2xl text-white">Nice Hotel Admin</h1>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#B98A3E]">
            {mode === "signin" ? "Sign in to your suite" : mode === "signup" ? "Create your account" : "Reset password"}
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-xs text-white/70">Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@nicehotel.com" className="border-white/15 bg-white/5 text-white placeholder:text-white/30" />
          </div>
          {mode !== "forgot" && (
            <div>
              <Label className="mb-1.5 block text-xs text-white/70">Password</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="border-white/15 bg-white/5 text-white placeholder:text-white/30" />
            </div>
          )}
          {mode === "signin" && (
            <div className="flex items-center justify-between text-xs text-white/60">
              <label className="flex items-center gap-2"><Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} className="border-white/30" /> Remember me</label>
              <button type="button" onClick={() => setMode("forgot")} className="text-[#B98A3E] hover:underline">Forgot password?</button>
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full bg-[#B98A3E] text-white hover:bg-[#a2772f]">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
          </Button>
        </form>
        <div className="mt-6 text-center text-xs text-white/50">
          {mode === "signin" ? (
            <>First time? <button onClick={() => setMode("signup")} className="text-[#B98A3E] hover:underline">Create an account</button></>
          ) : (
            <button onClick={() => setMode("signin")} className="text-[#B98A3E] hover:underline">Back to sign in</button>
          )}
        </div>
        <a href="/" className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-white/40 hover:text-white/70"><Hotel className="h-3 w-3" /> Back to website</a>
      </div>
    </div>
  );
}