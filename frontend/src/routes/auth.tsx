import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Socials from "@/components/home/footer/Socials";
import Footer from "@/components/layout/footer/Footer";
import Navigation from "@/components/layout/navigation/Navigation";

export const Route = createFileRoute("/auth")({
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/auth")
      throw redirect({
        to: "/auth/login",
        replace: true,
      });
    const response = await fetch("/api/auth/profile");
    if (response.ok) throw redirect({ to: "/app" });
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <>
      <Navigation />
      <Outlet />
      <Footer>
        <Socials />
      </Footer>
    </>
  );
}
