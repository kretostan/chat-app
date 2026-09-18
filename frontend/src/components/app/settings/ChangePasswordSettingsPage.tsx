import { useState } from "react";
import type { ChangePasswordValues } from "shared";
import { changePasswordSchema } from "shared";
import Input from "@/components/auth/form/Input";

type PasswordStrength = 0 | 1 | 2 | 3;

interface StrengthRequirements {
  length: boolean;
  maxLen: boolean;
}

export default function ChangePasswordSettingsPage() {
  const [values, setValues] = useState<ChangePasswordValues>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);

  const validate = changePasswordSchema.safeParse(values);
  const valid = validate.success;
  const strength = getPasswordStrength(values.newPassword);
  const requirements = getRequirements(values.newPassword);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError(null);
    setStatus("sending");

    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });
      if (!res.ok) throw new Error(`Status: ${res.status}`);

      setStatus("idle");
      setValues({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nie udało się zaktualizować hasła",
      );
      setStatus("idle");
    }
  };

  const handleChange = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  return (
    <div id="change-password">
      <h2
        className="text-xl font-semibold mb-1"
        style={{ color: "var(--foreground-primary)" }}
      >
        Zmień hasło
      </h2>
      <p className="text-sm text-foreground-muted mb-8">
        Podaj obecne hasło i wprowadź nowe
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
          <span style={{ color: "#fca5a5" }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Current password */}
        <div className="flex flex-col gap-1.5">
          <Input
            name="currentPassword"
            type="password"
            disabled={status === "sending"}
            value={values.currentPassword}
            onChange={(e) => handleChange("currentPassword", e.target.value)}
            placeholder="Obecne hasło"
            aria-label="Obecne hasło"
          >
            Obecne hasło
          </Input>
        </div>

        {/* New password */}
        <div className="flex flex-col gap-2">
          {values.newPassword && (
            <div className="flex items-center gap-1.5 px-0.5 h-0.75">
              <StrengthDots strength={strength} />
              <span
                className="text-xs ml-1"
                style={{ color: getStrengthColor(strength) }}
              >
                {["", "Słabe", "Średnie", "Mocne"][strength]}
              </span>
            </div>
          )}

          {requirements.length !== undefined && (
            <ul className="flex flex-col gap-0.5 ml-1 mt-1">
              <ReqMet checked={requirements.length}>
                Minimalna długość: 8 znaków
              </ReqMet>
              <ReqMet checked={requirements.maxLen}>
                Maksymalna długość: 128 znaków
              </ReqMet>
            </ul>
          )}

          <Input
            name="newPassword"
            type="password"
            value={values.newPassword}
            onChange={(e) => handleChange("newPassword", e.target.value)}
            placeholder="Nowe hasło"
            disabled={status === "sending"}
            aria-label="Nowe hasło"
          >
            Nowe hasło
          </Input>
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          {values.confirmPassword && values.newPassword && (
            <span
              className={`text-xs ml-1 mb-0.5 ${values.confirmPassword === values.newPassword ? "text-green-400" : "text-red-400"}`}
            >
              {values.confirmPassword === values.newPassword
                ? "Hasła się zgadzają"
                : "Hasła się nie zgadzają"}
            </span>
          )}
          <Input
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            placeholder="Powtórz nowe hasło"
            disabled={status === "sending"}
            aria-label="Powtórz nowe hasło"
          >
            Powtórz nowe hasło
          </Input>
        </div>

        <button
          type="submit"
          disabled={!valid || status === "sending"}
          className="px-4 py-2.5 text-xs font-medium rounded-lg transition-all cursor-pointer w-fit mt-1"
          style={{
            background: valid ? "var(--primary)" : "var(--surface-elevated)",
            color: valid ? "var(--text-primary)" : "var(--foreground-muted)",
            cursor: valid ? "pointer" : "not-allowed",
          }}
        >
          {status === "sending" ? (
            <span className="flex items-center gap-2">
              <svg
                aria-label="Sending"
                className="w-3.5 h-3.5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
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
              Aktualizowanie...
            </span>
          ) : (
            "Zaktualizuj hasło"
          )}
        </button>
      </form>
    </div>
  );
}

function StrengthDots({ strength }: { strength: PasswordStrength }) {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: "24px",
            height: "3px",
            borderRadius: "2px",
            backgroundColor:
              i < strength
                ? getStrengthColor(strength)
                : "var(--border-default)",
            transition: "background-color 0.2s ease",
          }}
        />
      ))}
    </div>
  );
}

function ReqMet({
  checked,
  children,
}: {
  checked?: boolean;
  children: React.ReactNode;
}) {
  const color = checked ? "#2ea043" : "var(--foreground-muted)";
  return (
    <li className="flex items-center gap-1.5 text-xs select-none transition-colors">
      <svg
        aria-label={checked ? "Checked" : "Unchecked"}
        className="w-3.5 h-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2}
      >
        {checked ? (
          <path
            d="M5 13l4 4L19 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <circle cx="12" cy="12" r="8" />
        )}
      </svg>
      <span style={{ color }}>{children}</span>
    </li>
  );
}

function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return 0;
  let score = password.length >= 8 ? 1 : 0;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return Math.min(score as PasswordStrength, 3) as PasswordStrength;
}

function getRequirements(password: string): StrengthRequirements {
  return {
    length: password.length >= 8,
    maxLen: password.length <= 128,
  };
}

function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 0:
      return "var(--foreground-muted)";
    case 1:
      return "#f59e0b";
    case 2:
      return "#2ea043";
    case 3:
      return "#3caae7";
  }
}
