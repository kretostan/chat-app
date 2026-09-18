import { createFileRoute } from "@tanstack/react-router";
import BackButton from "@/components/auth/BackButton";
import BreathingIndicator from "@/components/auth/BreathingIndicator";
import Footer from "@/components/auth/Footer";
import RegisterForm from "@/components/auth/form/RegisterForm";
import Header from "@/components/auth/Header";

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen my-20">
      <BackButton />
      <div className="flex flex-col items-center gap-3 w-full max-w-sm px-6">
        <Header
          title="Create your account"
          description="Start chatting with your people"
        />
        <BreathingIndicator />
        <div className="flex flex-col justify-center items-center gap-6 px-8 py-10 w-full bg-surface-section border border-border-default rounded-2xl auth-card-shadow">
          <RegisterForm />
        </div>
      </div>
      <div className="mt-6 mb-10 px-6">
        <Footer
          text="Already have an account?"
          linkText="Log in"
          to="/auth/login"
        />
      </div>
    </div>
  );
}
