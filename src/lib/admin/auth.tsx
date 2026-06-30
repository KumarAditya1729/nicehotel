import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole =
  | "super_admin"
  | "hotel_manager"
  | "restaurant_manager"
  | "event_manager"
  | "reception"
  | "content_manager"
  | "accountant"
  | "support";

interface AuthState {
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  isStaff: boolean;
  isSuperAdmin: boolean;
  hasRole: (...r: AppRole[]) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = async (uid: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
    setRoles((data ?? []).map((r) => r.role as AppRole));
  };

  const refresh = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user ?? null);
    if (data.user) await loadRoles(data.user.id);
    else setRoles([]);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadRoles(session.user.id);
      else setRoles([]);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthState = {
    user,
    roles,
    loading,
    isStaff: roles.length > 0,
    isSuperAdmin: roles.includes("super_admin"),
    hasRole: (...r) => r.some((x) => roles.includes(x)) || roles.includes("super_admin"),
    refresh,
    signOut: async () => {
      await supabase.auth.signOut();
      setUser(null);
      setRoles([]);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  hotel_manager: "Hotel Manager",
  restaurant_manager: "Restaurant Manager",
  event_manager: "Event Manager",
  reception: "Reception Staff",
  content_manager: "Content Manager",
  accountant: "Accountant",
  support: "Support Staff",
};