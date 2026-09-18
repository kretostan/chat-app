import { useEffect, useState } from "react";
import type { PublicUser } from "shared";

interface Props {
  onClose: () => void;
}

export default function NewConversationModal({ onClose }: Props) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState<number | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (search.length === 0) {
      setUsers([]);
      return;
    }
    timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(search)}`,
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setUsers(data);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async (memberId: number) => {
    setIsCreating(memberId);
    try {
      /* TODO: implement real creation once backend socket events are ready */
      // ws.send("room:create", { memberId })
      // or: await fetch("/api/chat/rooms", { method: "POST", body: JSON.stringify({ type: "dm", members: [memberId] }) })
      onClose();
    } catch {
      setUsers([]);
    } finally {
      setIsCreating(null);
    }
  };

  return (
    <div
      className="p-6 rounded-xl"
      style={{
        background: "var(--surface-section)",
        minWidth: 320,
        maxWidth: 420,
      }}
      role="dialog"
    >
      <div className="mb-4">
        <h2
          className="text-base font-semibold"
          style={{ color: "var(--foreground-primary)" }}
        >
          Nowa konwersacja
        </h2>
        <p className="text-xs mt-1 text-foreground-muted/70">
          Wyszukaj osobę, aby rozpocząć rozmowę
        </p>
      </div>

      {/* Search field */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Imię lub nazwa użytkownika"
        className="w-full px-3 py-2 mb-4 rounded-md text-sm outline-none border"
        style={{
          background: "var(--surface-input)",
          borderColor: "var(--border-default)",
          color: "var(--foreground-primary)",
        }}
      />

      {/* Results */}
      <ul
        className="max-h-60 overflow-y-auto"
        style={{ borderTop: "1px solid var(--border-default)" }}
      >
        {loading ? (
          <li className="px-3 py-3 text-xs text-foreground-muted/70 text-center">
            Szukam...
          </li>
        ) : users.length === 0 && search.length > 0 ? (
          <li className="px-3 py-3 text-xs text-foreground-muted/70 text-center">
            Brak wyników
          </li>
        ) : (
          users.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => handleCreate(u.id)}
                disabled={isCreating !== null}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-hover transition-colors"
                style={{
                  color: "var(--foreground-primary)",
                  opacity: isCreating ? 0.5 : 1,
                  cursor: isCreating ? "default" : "pointer",
                }}
              >
                {u.avatarUrl ? (
                  <img
                    src={u.avatarUrl}
                    alt=""
                    className="shrink-0 w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="shrink-0 w-8 h-8 rounded-full bg-surface-input flex items-center justify-center text-xs font-medium">
                    {(u.username[0] || "?").toUpperCase()}
                  </div>
                )}
                <span className="truncate">{u.username}</span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
