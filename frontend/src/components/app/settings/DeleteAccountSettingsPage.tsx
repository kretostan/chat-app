import { useState } from "react";
import Input from "@/components/auth/form/Input";

type Step = "idle" | "confirming" | "sending" | "success" | "error";

export default function DeleteAccountSettingsPage() {
  const [status, setStatus] = useState<Step>("idle");
  const [values, setValues] = useState({ code: "", confirmName: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (values.code !== "DELETE" || !values.confirmName) return;
    setStatus("sending");

    try {
      await fetch("/api/auth/user", { method: "DELETE" });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const handleCancel = () => {
    setStatus("idle");
    setValues({ code: "", confirmName: "" });
  };

  if (status === "success") {
    return (
      <div id="delete-account" className="sm:px-6">
        <h2
          className="text-xl font-semibold mb-1"
          style={{ color: "var(--foreground-primary)" }}
        >
          Usuń konto
        </h2>
        <p className="text-sm text-foreground-muted mb-8">
          Kliknij poniżej, aby usunąć konto z systemu ponownie
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
              aria-hidden="true"
              className="w-5 h-5 shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              style={{ color: "#2ea043" }}
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
                Żądanie wysłane
              </p>
              <p className="text-xs text-foreground-muted">
                Konto zostanie usunięte w ciągu 7 dni od momentu otrzymania
                potwierdzenia mailowego.
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
    <div id="delete-account" className="sm:px-6">
      <h2
        className="text-xl font-semibold mb-1"
        style={{ color: "var(--foreground-primary)" }}
      >
        Usuń konto
      </h2>
      <p className="text-sm text-foreground-muted mb-8">
        Jeśli chcesz trwale usunąć swoje konto z systemu
      </p>

      {status !== "idle" ? (
        <>
          <div
            style={{
              background: "rgba(245, 158, 11, 0.06)",
              border: "1px solid rgba(245, 158, 11, 0.15)",
            }}
            className="rounded-xl px-5 py-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <svg
                aria-hidden="true"
                className="w-5 h-5 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                style={{ color: "#f59e0b" }}
              >
                <path
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex-1">
                <p
                  className="text-sm font-medium mb-0.5"
                  style={{ color: "#f59e0b" }}
                >
                  Ta akcja jest nieodwracalna
                </p>
                <p className="text-xs text-foreground-muted">
                  Wszystkie Twoje dane, wiadomości i ustawienia zostaną trwale
                  usunięte. Aby potwierdzić wpisz{" "}
                  <strong style={{ color: "var(--foreground-primary)" }}>
                    DELETE
                  </strong>{" "}
                  oraz podaj nazwę użytkownika.
                </p>
              </div>
            </div>
          </div>

          {status === "error" && (
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
                aria-label="Error deleting account"
              >
                <path
                  d="M12 9v4m-4-5L16.66 4.34C17.18 3.82 18 3.5 18 4v9c0 .5-.82.18-1.34-.34L12 9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={{ color: "#fca5a5" }}>
                Nie udało się usunąć konta. Spróbuj ponownie.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Input
                name="confirmation"
                value={values.code}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, code: e.target.value }))
                }
                placeholder="DELETE"
                disabled={status === "sending"}
              >
                Wpisz DELETE, aby potwierdzić
              </Input>
            </div>

            <div className="flex flex-col gap-1.5">
              <Input
                name="username"
                value={values.confirmName}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    confirmName: e.target.value,
                  }))
                }
                placeholder="Twoja nazwa użytkownika"
                disabled={status === "sending"}
              >
                Podaj nazwę użytkownika
              </Input>
            </div>

            <div className="flex items-center gap-3 w-fit">
              <button
                type="button"
                onClick={handleCancel}
                className="text-xs font-medium rounded-lg transition-colors hover:bg-hover px-2 py-1.5"
                style={{ color: "var(--foreground-secondary)" }}
                tabIndex={0}
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={
                  values.code !== "DELETE" ||
                  !values.confirmName ||
                  status === "sending"
                }
                className="px-4 py-2.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap"
                style={{
                  background:
                    values.code === "DELETE" && values.confirmName
                      ? "rgba(220, 38, 38, 0.1)"
                      : "var(--surface-elevated)",
                  color:
                    values.code === "DELETE" && values.confirmName
                      ? "#f87171"
                      : "var(--foreground-muted)",
                  cursor:
                    values.code === "DELETE" && values.confirmName
                      ? "pointer"
                      : "not-allowed",
                  border:
                    values.code === "DELETE" && values.confirmName
                      ? "1px solid rgba(220, 38, 38, 0.2)"
                      : "none",
                }}
              >
                {status === "sending" ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-label="Deleting account"
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
                    Usuwanie...
                  </span>
                ) : (
                  "Usuń konto"
                )}
              </button>
            </div>
          </form>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setStatus("confirming")}
          className="px-4 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer"
          style={{
            background: "rgba(220, 38, 38, 0.06)",
            color: "#f87171",
            border: "1px solid rgba(220, 38, 38, 0.15)",
          }}
        >
          Usuń konto
        </button>
      )}
    </div>
  );
}
