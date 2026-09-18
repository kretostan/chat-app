import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Navigation from "@/components/layout/navigation/Navigation";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const response = await fetch("/api/auth/profile");
    if (!response.ok) throw redirect({ to: "/auth/login" });
  },
  component: AppLayout,
  errorComponent: () => <div>Error</div>,
  notFoundComponent: () => <div>Not Found 404</div>,
});

function AppLayout() {
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
}
