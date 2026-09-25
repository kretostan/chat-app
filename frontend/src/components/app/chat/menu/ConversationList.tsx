import type { ChatRoomDetails } from "shared";

interface ConversationListProps {
  currentUserId: number;
  rooms: ChatRoomDetails[];
  activeRoomId: number | null;
  onSelect: (roomId: number) => void;
}

export default function ConversationList({
  currentUserId,
  rooms,
  activeRoomId,
  onSelect,
}: ConversationListProps) {
  if (rooms.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm opacity-50">Brak konwersacji</p>
      </div>
    );
  }

  function formatDate(isoStr: string | null): string {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "wcz.";
    if (diffDays < 7)
      return date.toLocaleDateString("pl-PL", { weekday: "short" });
    if (diffDays < 30)
      return date.toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "2-digit",
      });

    return date.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "2-digit",
      year: "2-digit",
    });
  }

  return (
    <ul className="flex flex-col gap-3 items-center w-full overflow-y-auto md:w-80 scrollbar-none h-screen overflow-hidden">
      {rooms.map((room) => {
        const otherMember = room.members.find(
          (member) => member.id !== currentUserId,
        );
        const isActive = activeRoomId === room.id;

        return (
          <li
            key={room.id}
            className="flex flex-col gap-6 w-full rounded-2xl"
            style={{ background: isActive ? "#222530" : "#191C24" }}
          >
            <button
              type="button"
              onClick={() => onSelect(room.id)}
              className="flex items-center gap-3 py-3.5 px-4 cursor-pointer transition-colors duration-100 w-full"
            >
              {/* Avatar */}
              <div
                className="shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-sm font-medium"
                style={{
                  background: "var(--surface-input)",
                  color: "var(--foreground-primary)",
                }}
              >
                {room.name
                  ? room.name.charAt(0)
                  : otherMember
                    ? otherMember.username.charAt(0)
                    : "?"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--foreground-primary)" }}
                  >
                    {room.name || otherMember?.username || "?"}
                  </p>
                  {room.lastMessageAt && (
                    <span className="shrink-0 text-[11px] tabular-nums whitespace-nowrap ml-2 opacity-50">
                      {formatDate(room.lastMessageAt)}
                    </span>
                  )}
                </div>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--foreground-secondary)" }}
                >
                  {room.name ? "(grupa)" : `od: ${otherMember?.username}`}
                </p>
                <p className="text-xs text-foreground-muted/70 overflow-hidden opacity-50">
                  {room.lastMessage?.content ?? "Brak wiadomości"}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
