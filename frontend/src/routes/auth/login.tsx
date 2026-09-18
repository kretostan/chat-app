import { createFileRoute } from "@tanstack/react-router";
import BreathingIndicator from "@/components/auth/BreathingIndicator";
import Footer from "@/components/auth/Footer";
import LoginForm from "@/components/auth/form/LoginForm";
import Header from "@/components/auth/Header";

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen my-20">
      <div className="flex flex-col items-center gap-3 w-full max-w-sm px-6">
        <Header title="Welcome back" description="Log in to your account" />
        <BreathingIndicator />
        <div className="flex flex-col justify-center items-center gap-6 px-8 py-10 w-full bg-surface-section border border-border-default rounded-2xl auth-card-shadow">
          <LoginForm />
        </div>
      </div>
      <Footer
        text="Don't have an account?"
        linkText="Sign up"
        to="/auth/register"
      />
    </div>
  );
}
