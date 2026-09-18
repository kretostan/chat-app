import { useState } from "react";
import type { ChangeEmailValues } from "shared";
import { changeEmailSchema } from "shared";
import Input from "@/components/auth/form/Input";

type EmailStatus = "idle" | "sending" | "sent" | "error";

export default function ChangeEmailSettingsPage() {
  const [status, setStatus] = useState<EmailStatus>("idle");
  const [newEmail, setNewEmail] = useState("");
  const [values, setValues] = useState<ChangeEmailValues>({ email: "" });
  const [error, setError] = useState<string | null>(null);

  const valid = changeEmailSchema.safeParse(values).success;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError(null);
    setStatus("sending");

    try {
      const res = await fetch("/api/auth/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      setNewEmail(values.email);
      setStatus("sent");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nie udało się wysłać weryfikacji",
      );
      setStatus("error");
    }
  };

  const handleCancel = () => {
    setStatus("idle");
    setValues({ email: "" });
    setNewEmail("");
    setError(null);
  };

  if (status === "sent") {
    return (
      <div id="change-email" className="sm:px-6">
        <h2
          className="text-xl font-semibold mb-1"
          style={{ color: "var(--foreground-primary)" }}
        >
          Zmień e-mail
        </h2>
        <p className="text-sm text-foreground-muted mb-8">
          Aby zmienić adres e-mail zaktualizowany na twoim koncie
        </p>

        <div
          style={{
            background: "rgba(42, 160, 67, 0.06)",
            border: "1px solid rgba(42, 160, 67, 0.15)",
          }}
          className="rounded-xl px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ color: "#2ea043" }}
              aria-label="Verification email sent"
            >
              <path
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 21c-5.235 0-9.87-1.507-13.37-4.06"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex-1">
              <p
                className="text-sm font-medium mb-0.5"
                style={{ color: "#2ea043" }}
              >
                Wysłano e-mail weryfikacyjny
              </p>
              <p className="text-xs text-foreground-muted">
                Link do potwierdzenia został wysłany na{" "}
                <span
                  style={{ color: "var(--foreground-primary)" }}
                  className="font-medium"
                >
                  {newEmail}
                </span>
                . Kliknij w link z maila, aby zatwierdzić zmianę adresu.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          className="mt-4 text-xs font-medium rounded-lg transition-colors hover:bg-hover px-2 py-1.5"
          style={{ color: "var(--foreground-secondary)" }}
          tabIndex={0}
        >
          Anuluj
        </button>
      </div>
    );
  }

  return (
    <div id="change-email" className="sm:px-6">
      <h2
        className="text-xl font-semibold mb-1"
        style={{ color: "var(--foreground-primary)" }}
      >
        Zmień e-mail
      </h2>
      <p className="text-sm text-foreground-muted mb-8">
        Aby zmienić adres e-mail zaktualizowany na twoim koncie
      </p>

      {error && (
        <div
          role="alert"
          style={{
            background: "rgba(220, 38, 38, 0.1)",
            border: "1px solid rgba(220, 38, 38, 0.2)",
          }}
          className="mb-5 rounded-xl px-4 py-3 flex items-center gap-2.5 text-sm"
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-label="Error verifying email"
          >
            <path
              d="M12 9v4m-4-5L16.66 4.34C17.18 3.82 18 3.5 18 4v9c0 .5-.82.18-1.34-.34L12 9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ color: "#fca5a5" }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Input
            name="email"
            type="email"
            placeholder="mail@example.com"
            value={values.email}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, email: e.target.value }))
            }
            disabled={status === "sending"}
            aria-label="Nowy adres e-mail"
          >
            Nowy adres email
          </Input>
        </div>

        <button
          type="submit"
          disabled={!valid || status === "sending"}
          className="px-4 py-2.5 text-xs font-medium rounded-lg transition-all cursor-pointer w-fit"
          style={{
            background: valid ? "var(--primary)" : "var(--surface-elevated)",
            color: valid ? "var(--text-primary)" : "var(--foreground-muted)",
            cursor: valid ? "pointer" : "not-allowed",
          }}
        >
          {status === "sending" ? (
            <span className="flex items-center gap-2">
              <svg
                className="w-3.5 h-3.5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-label="Sending verification"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Wysyłanie...
            </span>
          ) : (
            "Wyślij weryfikację"
          )}
        </button>
      </form>
    </div>
  );
}
