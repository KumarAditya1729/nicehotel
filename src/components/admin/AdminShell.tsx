import { useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, CalendarCheck, BedDouble, UtensilsCrossed, Tag, MessageSquare,
  LogOut, Menu as MenuIcon, X, Hotel, Search, FileText,
  ConciergeBell, PartyPopper, Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminLogout } from "@/lib/admin.functions";
import { NotificationBell } from "@/components/admin/NotificationBell";
import logo from "@/assets/nice-logo.png";

interface NavItem { to: string; label: string; icon: typeof LayoutDashboard; roles?: string[]; }

const NAV: { section: string; items: NavItem[] }[] = [
  { section: "Overview", items: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { section: "Operations", items: [
    { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
    { to: "/admin/rooms", label: "Rooms", icon: BedDouble },
    { to: "/admin/services", label: "Services", icon: ConciergeBell },
    { to: "/admin/events", label: "Venue & Events", icon: PartyPopper },
    { to: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  ]},
  { section: "Restaurant", items: [
    { to: "/admin/menu", label: "Menu Builder", icon: UtensilsCrossed },
    { to: "/admin/offers", label: "Offers", icon: Tag },
    { to: "/admin/cms", label: "Site CMS", icon: FileText },
  ]},
  { section: "Communications", items: [
    { to: "/admin/emails", label: "Email Center", icon: Mail },
  ]},
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openMobile, setOpenMobile] = useState(false);

  const canSee = (_item: NavItem) => true;

  const handleSignOut = async () => {
    await adminLogout();
    navigate({ to: "/", replace: true });
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1a1a1a]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#161616] text-white/80 transition-transform duration-300 lg:translate-x-0 ${openMobile ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-5">
          <img src={logo} alt="Nice Hotel" className="h-8 w-8 rounded-md object-contain" />
          <div className="leading-tight">
            <p className="font-display text-base text-white">Nice Hotel</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#B98A3E]">Admin Suite</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setOpenMobile(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="h-[calc(100vh-4rem)] overflow-y-auto px-3 py-5 [scrollbar-width:thin]">
          {NAV.map((group) => {
            const items = group.items.filter(canSee);
            if (items.length === 0) return null;
            return (
              <div key={group.section} className="mb-5">
                <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.18em] text-white/30">{group.section}</p>
                {items.map((item) => {
                  const active = pathname === item.to;
                  return (
                    <Link key={item.to} to={item.to} onClick={() => setOpenMobile(false)}
                      className={`mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? "bg-[#B98A3E] text-white shadow-lg shadow-[#B98A3E]/20" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
                      <item.icon className="h-[18px] w-[18px]" />{item.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>

      {openMobile && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpenMobile(false)} />}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-black/5 bg-white/70 px-4 backdrop-blur-xl lg:px-8">
          <button className="lg:hidden" onClick={() => setOpenMobile(true)}><MenuIcon className="h-5 w-5" /></button>
          <div className="relative hidden flex-1 sm:block sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search bookings, rooms, guests..." className="w-full rounded-full border border-black/10 bg-[#FAFAF8] py-2 pl-9 pr-4 text-sm outline-none focus:border-[#B98A3E]" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/" className="hidden items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs text-muted-foreground hover:border-[#B98A3E] sm:flex">
              <Hotel className="h-3.5 w-3.5" /> View Site
            </Link>
            <NotificationBell />
            <div className="text-right leading-tight">
              <p className="text-xs font-medium">Administrator</p>
              <p className="text-[10px] text-[#B98A3E]">Full Access</p>
            </div>
            <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleSignOut} title="Sign out"><LogOut className="h-4 w-4" /></Button>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl text-[#161616]">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}