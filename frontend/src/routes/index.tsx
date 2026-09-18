import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Cta from "@/components/home/cta/Cta";
import Features from "@/components/home/features/Features";
import Socials from "@/components/home/footer/Socials";
import Hero from "@/components/home/Hero";
import List from "@/components/home/navigation/List";
import MobileList from "@/components/home/navigation/MobileList";
import Footer from "@/components/layout/footer/Footer";
import Navigation from "@/components/layout/navigation/Navigation";
import PrimaryButton from "@/components/layout/navigation/PrimaryButton";
import { useMobile } from "@/hooks";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const isMobile = useMobile();
  const navigate = useNavigate({ from: Route.fullPath });
  return (
    <>
      <Navigation>
        {isMobile ? <MobileList /> : <List />}
        <PrimaryButton onClick={() => navigate({ to: "/auth/login" })}>
          Sign in
        </PrimaryButton>
      </Navigation>
      <Hero />
      <div className="flex flex-col justify-center items-center">
        <Features />
        <Cta />
      </div>
      <div className="w-full">
        <Footer>
          <Socials />
        </Footer>
      </div>
    </>
  );
}
