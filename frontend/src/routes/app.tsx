import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const response = await fetch("/api/auth/profile");
    if (!response.ok) throw redirect({ to: "/auth/login" });
    if (location.pathname === "/app") {
      throw redirect({
        to: "/app/chat",
      });
    }
  },
  component: AppLayout,
  errorComponent: () => <div>Error</div>,
  notFoundComponent: () => <div>Not Found 404</div>,
});

function AppLayout() {
  return <Outlet />;
}
