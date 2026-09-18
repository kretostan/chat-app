import { createFileRoute } from "@tanstack/react-router";
import { type SubmitEvent, useState } from "react";
import Alert from "@/components/auth/Alert";
import BreathingIndicator from "@/components/auth/BreathingIndicator";
import Footer from "@/components/auth/Footer";
import Input from "@/components/auth/form/Input";
import Header from "@/components/auth/Header";

export const Route = createFileRoute("/auth/reset")({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your username or email.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Couldn't find that account.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen my-20">
      <div className="flex flex-col items-center gap-3 w-full max-w-sm px-6">
        <Header
          title={success ? "Check your email" : "Reset your password"}
          description={
            success
              ? "If that account exists, you'll hear from us soon."
              : "We'll help you back in"
          }
        />
        <BreathingIndicator />

        {success ? (
          <div className="flex flex-col items-center gap-6 px-8 py-10 w-full bg-surface-section border border-border-default rounded-2xl auth-card-shadow">
            <p className="text-sm text-foreground-secondary text-center leading-relaxed">
              If the account exists, follow the link we've sent to verify your
              identity and set a new password.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center items-center gap-6 px-8 py-10 w-full bg-surface-section border border-border-default rounded-2xl auth-card-shadow"
          >
            <Input
              type="text"
              name="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-xs w-full"
            >
              Username or email
            </Input>
            {error && <Alert description={error} />}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full mt-1 py-3 text-sm font-semibold transition-colors rounded-lg cursor-pointer disabled:cursor-not-allowed bg-primary text-white hover:bg-secondary disabled:text-foreground-muted disabled:bg-surface-elevated"
            >
              {loading ? "Sending…" : "Continue"}
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 mb-10 px-6">
        <Footer
          text="Remember it?"
          linkText="Back to log in"
          to="/auth/login"
        />
      </div>
    </div>
  );
}
