import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SessionInfo } from "shared";

interface SessionEntry {
  username: string;
  sessionUuid: string;
}

const SESSIONS_KEY = "sessions";

function getThisDeviceSessionUuid(): string | null {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return null;
    const parsed: Record<number, SessionEntry> = JSON.parse(raw);
    const entries = Object.values(parsed);
    const userSession =
      entries.length > 0
        ? entries.find((session) => session.username === "alice")
        : null; // FIX: Hardcoded username, a powinno być session.userId === user.id

    return userSession ? userSession.sessionUuid : null;
  } catch {
    return null;
  }
}

function formatRelative(isoStr: string): string {
  const ms = Date.now() - new Date(isoStr).getTime();
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "teraz";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} godz. temu`;
  const days = Math.floor(hours / 24);
  return `${days} dni temu`;
}

function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isCurrentDevice(
  sessionUuid: string | null,
  myUuid: string | null,
): boolean {
  return sessionUuid === myUuid;
}

function ErrorMessage({
  text,
  onDismiss,
}: {
  text: string;
  onDismiss?: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!onDismiss) return;
    timerRef.current = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timerRef.current);
  }, [onDismiss]);

  return (
    <div
      className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
      style={{
        background: "rgba(220, 38, 38, 0.1)",
        border: "1px solid rgba(220, 38, 38, 0.2)",
      }}
    >
      <svg
        aria-hidden="true"
        className="w-4 h-4 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          d="M12 9v4m-4-5L16.66 4.34C17.18 3.82 18 3.5 18 4v9c0 .5-.82.18-1.34-.34L12 9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span style={{ color: "#fca5a5", flex: 1 }}>{text}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="opacity-60 hover:opacity-100 transition-opacity"
          style={{ color: "#fca5a5" }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

function CurrentDeviceCard({ device }: { device: SessionInfo }) {
  let icon: React.ReactNode;
  switch (device.deviceName) {
    case "Android":
      icon = "📱";
      break;
    case "iOS":
      icon = "📱";
      break;
    default:
      icon = device.deviceName.toLowerCase().includes("windows")
        ? "🖥️"
        : device.deviceName.toLowerCase().includes("linux")
          ? "🐧"
          : device.deviceName.toLowerCase().includes("mac")
            ? "💻"
            : "💻";
  }

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-xl"
      style={{
        background: "rgba(48, 166, 219, 0.04)",
        border: "1px solid rgba(48, 166, 219, 0.2)",
      }}
    >
      <div
        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        style={{ background: "rgba(48, 166, 219, 0.1)" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--foreground-primary)" }}
        >
          {device.deviceName}
        </p>
        <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
          {formatDate(device.lastUsedAt)}
        </p>
      </div>
      {/* TODO: Sprawdzić */}
      {/* TODO: Chat - what do you think about moving span below above active card, and add button to remove current session. Dodatkowo jeśli miałbym to wdrożyć to trzeba umożliwić na serwerze usuwanie aktywnej sesji. Usunięcie sesji musi też usunąć item z localStorage. Jeśli przeniesiemy "Active" nad kartę to podmienić tu Anuluj + Wyloguj z normalnej karty sesji. */}
      {/* FIX: Jeśli odpali się apkę na Firefox i potem na Chrome, to nie będzie widać na Chrome, odświeżonego odpalenia Firefoxa. */}
      {/* FIX: Dodać React Query i przechowywać tam /user/profile i przy odświeżeniu aktualizować używanie sesji */}
      {/* FIX: Usunięcie sesji Chrome będąc na Firefox, nie powoduje wylogowania w Chrome (też włączonym jednocześnie). */}
      <span
        className="shrink-0 text-xs px-2.5 py-1 rounded-lg font-medium"
        style={{ background: "rgba(48, 166, 219, 0.1)", color: "#3caae7" }}
      >
        Active
      </span>
    </div>
  );
}

interface DeviceCardProps {
  session: SessionInfo;
  isCurrent: boolean;
  confirmId: number | null;
  logoutId: number | null;
  onConfirm: (id: number) => void;
  onLogout: (id: number) => void;
  onCancel: () => void;
}

function DeviceCard({
  session,
  isCurrent,
  confirmId: openConfirm,
  logoutId: activeLogout,
  onConfirm,
  onLogout,
  onCancel,
}: DeviceCardProps) {
  if (isCurrent) return null;

  const isLoading = activeLogout === session.id;
  const showConfirm = openConfirm === session.id;

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-xl"
      style={{
        background: "var(--surface-section)",
        border: "1px solid var(--border-default)",
      }}
    >
      <div
        className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        style={{ background: "var(--surface-input)" }}
      >
        {session.deviceName.toLowerCase().includes("windows")
          ? "🖥️"
          : session.deviceName.toLowerCase().includes("mac") ||
              session.deviceName.toLowerCase().includes("iphone")
            ? "💻"
            : session.deviceName.toLowerCase().includes("linux")
              ? "🐧"
              : "📱"}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: "var(--foreground-primary)" }}
        >
          {session.deviceName}
        </p>
        {/* FIX: logika lastused do poprawy, częsciej aktualizowac albo lepiej */}
        <p className="text-xs text-foreground-muted">
          Dodano {formatDate(session.createdAt)}. Ostatnio użyte{" "}
          {formatRelative(session.lastUsedAt)}
        </p>
      </div>

      {showConfirm ? (
        <div className="flex flex-col items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onLogout(session.id)}
            disabled={isLoading}
            className="px-3 py-1.5 w-full text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
            style={{
              color: "#f87171",
              background: isLoading
                ? "rgba(220, 38, 38, 0.04)"
                : "rgba(220, 38, 38, 0.08)",
              cursor: isLoading ? "default" : "pointer",
            }}
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5 justify-center">
                <svg
                  aria-label="Loading session"
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
              </span>
            ) : (
              "Wyloguj"
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 w-full text-xs rounded-lg transition-colors hover:bg-hover whitespace-nowrap"
            style={{ color: "var(--foreground-secondary)" }}
          >
            Anuluj
          </button>
        </div>
      ) : (
        <motion.button
          initial={{
            color: "var(--foreground-secondary)",
            backgroundColor: "transparent",
          }}
          whileHover={{
            color: "var(--tertiary)",
            backgroundColor: "var(--hover)",
          }}
          onClick={() => onConfirm(session.id)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-foreground-secondary shrink-0 whitespace-nowrap"
        >
          Wyloguj
        </motion.button>
      )}
    </div>
  );
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoutId, setLogoutId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const myUuid = useRef(getThisDeviceSessionUuid());

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/sessions");
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      const data: SessionInfo[] = await res.json();
      setSessions(
        data.sort(
          (a, b) =>
            new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime(),
        ),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Nieznany błąd";
      setError(`Nie udało się zaktualizować sesji: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleConfirm = (id: number) =>
    setConfirmId(confirmId === id ? null : id);
  const handleCancelConfirm = () => setConfirmId(null);

  const handleLogout = async (id: number) => {
    const sessionToRemove = sessions.find((s) => s.id === id);
    if (!sessionToRemove) return;

    // Optimistic remove
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setConfirmId(null);
    setLogoutId(id);

    try {
      const res = await fetch(`/api/auth/sessions/${id}/logout`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Nie udało się wylogować";
      setSessions((prev) => [...prev, sessionToRemove]);
      setError(msg);
    } finally {
      setLogoutId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full overflow-y-auto">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8 animate-pulse space-y-2">
            <div className="h-7 w-36 bg-border-default rounded" />
            <div className="h-4 w-52 bg-border-default rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map(() => (
              <div
                key={crypto.randomUUID()}
                className="flex items-center gap-4 px-5 py-4 animate-pulse rounded-xl"
                style={{ background: "var(--surface-section)" }}
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-border-default" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-[35%] min-w-28 bg-border-default rounded" />
                  <div className="h-3.5 w-[55%] min-w-32 bg-border-default rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentSession = sessions.find((s) =>
    isCurrentDevice(s.sessionUuid, myUuid.current),
  );
  const otherSessions = sessions.filter(
    (s) => !isCurrentDevice(s.sessionUuid, myUuid.current),
  );

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto">
      <div className="max-w-md mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--foreground-primary)" }}
          >
            Sesje
          </h2>
          <p className="text-sm mt-0.5 text-foreground-muted">
            Urządzenia zalogowane na twoje konto
          </p>
        </div>

        {/* Error */}
        {error && (
          <ErrorMessage text={error} onDismiss={() => setError(null)} />
        )}

        {/* Current device */}
        {currentSession && <CurrentDeviceCard device={currentSession} />}

        {/* Other sessions section title */}
        {otherSessions.length > 0 &&
          (currentSession ? (
            <p
              className="text-xs font-medium uppercase tracking-wider mb-2 mt-8"
              style={{ color: "var(--foreground-secondary)" }}
            >
              inne urządzenia ({otherSessions.length})
            </p>
          ) : null)}

        {/* Other sessions */}
        {otherSessions.map((session) => (
          <div key={session.id} className="mt-3">
            <DeviceCard
              session={session}
              isCurrent={isCurrentDevice(session.sessionUuid, myUuid.current)}
              confirmId={confirmId}
              logoutId={logoutId}
              onConfirm={handleConfirm}
              onLogout={handleLogout}
              onCancel={handleCancelConfirm}
            />
          </div>
        ))}

        {/* Empty: no current device */}
        {!currentSession && otherSessions.length === 0 && (
          <div
            className="flex items-center justify-center py-20 rounded-xl"
            style={{ background: "var(--surface-section)" }}
          >
            <p className="text-sm text-foreground-muted">
              Brak aktywnych sesji
            </p>
          </div>
        )}

        {/* Empty: only current, no others */}
        {currentSession && otherSessions.length === 0 && (
          <>
            <div className="h-8" />
            <div
              className="flex items-center justify-center py-4 rounded-xl border"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--foreground-secondary)",
              }}
            >
              <p className="text-xs text-foreground-muted">
                Brak innych urządzeń
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
