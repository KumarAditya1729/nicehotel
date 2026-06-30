import { createFileRoute, Outlet } from "@tanstack/react-router";

// Admin area is protected by a shared-password gate (see admin.tsx),
// not Supabase user auth. This layout simply renders its children.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: () => <Outlet />,
});
