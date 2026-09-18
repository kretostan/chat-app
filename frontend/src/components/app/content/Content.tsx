import { useCallback, useEffect, useRef, useState } from "react";
import type { BroadcastMessage, PaginatedRooms, PublicUser } from "shared";
import Arrow from "@/assets/arrow-narrow.svg?react";
import MessageBubble from "@/components/app/messages/MessageBubble";
import MessageInput from "@/components/app/messages/MessageInput";
import { MessageListSkeleton } from "@/components/app/messages/Skeleton";
import { useMobile } from "@/hooks/useMobile";
import { useWebSocket } from "@/hooks/useWebSocket";

interface ContentProps {
  roomId: number;
  roomsData: PaginatedRooms;
  user: PublicUser;
  isLoadingRoom?: boolean;
  onBack?: () => void;
}

export default function Content({
  roomId,
  roomsData,
  user,
  isLoadingRoom: isRoomLoading,
  onBack,
}: ContentProps) {
  const isMobile = useMobile();
  const ws = useWebSocket();

  // Room data (counterpart info)
  const room = roomsData.rooms.find((r) => r.id === roomId);
  const otherMember = room?.members.find((m) => m.id !== user.id);

  // Messages state
  const [messages, setMessages] = useState<Record<string, BroadcastMessage[]>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [_hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scroll refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isManuallyScrolling, setIsManuallyScrolling] = useState(false);
  const messageIds = useRef(new Map<string, BroadcastMessage>());

  // Sending status (which optimistic messages are still pending)
  const [_sendingSet, setSendingSet] = useState<Set<string>>(new Set());

  const aggregateByDate = useCallback((messagesList: BroadcastMessage[]) => {
    const aggregated: Record<string, BroadcastMessage[]> = {};
    for (const msg of messagesList) {
      const dateKey = new Date(msg.createdAt).toISOString().slice(0, 10);
      if (!aggregated[dateKey]) aggregated[dateKey] = [];
      aggregated[dateKey].push(msg);
    }

    const sortedKeys = Object.keys(aggregated).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    const reversedKeys = sortedKeys.reverse();
    for (const key of reversedKeys) {
      aggregated[key].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    return aggregated;
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setMessages({});

    async function fetchMessages() {
      try {
        const res = await fetch(`/api/chat/rooms/${roomId}/messages?limit=30`);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        setMessages(aggregateByDate(data.messages));
        setHasMore(data.hasMore || false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(`Nie udało się załadować wiadomości: ${msg}`);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [roomId, aggregateByDate]);

  useEffect(() => {
    if (!isManuallyScrolling) scrollToBottom();
  }, [isManuallyScrolling, scrollToBottom]);

  // WebSocket updates
  useEffect(() => {
    const unsubscribe = ws.on("message:new", (msg: BroadcastMessage) => {
      if (msg.chatRoomId !== roomId) return;

      setMessages((prev) => {
        const dateKey = new Date(msg.createdAt).toISOString().slice(0, 10);
        const existingDateGroup = prev[dateKey] || [];

        const alreadyExists = existingDateGroup.some(
          (m) => m.id === msg.id || m.clientMessageId === msg.clientMessageId,
        );
        if (alreadyExists) return prev;

        let updated: BroadcastMessage[];
        // Replace optimistic message with server version
        const optimisticKey = msg.clientMessageId || String(msg.id);
        if (msg.clientMessageId && messageIds.current.has(optimisticKey)) {
          updated = existingDateGroup.map((m) =>
            m.clientMessageId === msg.clientMessageId ? msg : m,
          );
          messageIds.current.delete(optimisticKey);
          setSendingSet((s) => {
            const next = new Set(s);
            next.delete(optimisticKey);
            return next;
          });
        } else {
          updated = [...existingDateGroup, msg];
        }

        return { ...prev, [dateKey]: updated };
      });
    });

    return unsubscribe;
  }, [ws, roomId]);

  const handleSend = async (msgText: string) => {
    const clientMessageId = `optimistic_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date();

    setMessages((prev) => {
      const dateKey = now.toISOString().slice(0, 10);
      const updatedMessage: BroadcastMessage = {
        id: -1,
        content: msgText,
        userId: user.id,
        createdAt: now.toISOString(),
        clientMessageId,
        chatRoomId: roomId,
      };

      messageIds.current.set(clientMessageId, updatedMessage);

      const existingGroup = prev[dateKey] || [];
      return { ...prev, [dateKey]: [...existingGroup, updatedMessage] };
    });

    setSendingSet((prev) => new Set(prev).add(clientMessageId));

    try {
      await ws.send("message:send", {
        roomId,
        content: msgText,
        clientMessageId,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Nie udało się wysłać wiadomości: ${msg}`);

      // Remove optimistic message on failure
      setMessages((prev) => {
        const dateKey = now.toISOString().slice(0, 10);
        const existingGroup = prev[dateKey] || [];
        const updated = existingGroup.filter(
          (m) => m.clientMessageId !== clientMessageId,
        );
        if (updated.length === 0) {
          const copy = { ...prev };
          delete copy[dateKey];
          return copy;
        }
        return { ...prev, [dateKey]: updated };
      });
    } finally {
      setSendingSet((prev) => {
        const next = new Set(prev);
        next.delete(clientMessageId);
        return next;
      });
    }
  };

  const isOwn = useCallback(
    (msg: BroadcastMessage): boolean => msg.userId === user.id,
    [user.id],
  );

  function formatMessageDate(key: string): string {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    if (key === today) return "Dziś";
    if (key === yesterday) return "Wczoraj";
    return new Date(`${key}T00:00:00`).toLocaleDateString("pl-PL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
      ?.firstElementChild as HTMLElement | null;
    if (!el) return;
    // const maxScrollHeight =
    //   (scrollContainerRef.current as HTMLDivElement)?.scrollHeight -
    //   (scrollContainerRef.current as HTMLDivElement)?.clientHeight;

    setIsManuallyScrolling((prev) => prev || el.scrollTop < 50);
  }, []);

  // Show skeleton when waiting for room data
  if (isRoomLoading && Object.keys(messages).length === 0) {
    return (
      <div className="flex flex-col h-full w-full">
        <div
          className="flex shrink-0 items-center justify-between px-4 h-16 border-b"
          style={{
            background: "var(--surface-section)",
            borderColor: "var(--border-default)",
          }}
        >
          <div className="w-64">
            <div className="h-4 w-28 bg-border-default rounded animate-pulse" />
          </div>
        </div>
        <MessageListSkeleton count={8} />
      </div>
    );
  }

  // Show error state
  if (error && Object.keys(messages).length === 0) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <p className="text-sm text-foreground-muted">
          {error || "Brak wiadomości"}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-primary hover:underline"
        >
          Odśwież
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Chat header */}
      <div
        className="flex shrink-0 items-center justify-between px-4 h-16"
        style={{
          background: "var(--surface-section)",
          borderBottom: `1px solid var(--border-default)`,
        }}
      >
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Wróć do listy konwersacji"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-hover active:bg-active transition-colors"
            >
              <Arrow height={20} width={20} />
            </button>
          )}
          <div
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
            style={{
              background: "var(--surface-input)",
              color: "var(--foreground-primary)",
            }}
          >
            {(room?.name || otherMember?.username)?.charAt(0).toUpperCase() ??
              "?"}
          </div>
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--foreground-primary)" }}
            >
              {room?.name || otherMember?.username || "?"}
            </p>
            {room?.type === "group" && (
              <p className="text-xs text-foreground-muted">
                {room.members.length} członków
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto"
      >
        <div className="flex flex-col flex-1 px-4 py-3">
          {loading ? (
            <MessageListSkeleton count={8} />
          ) : Object.keys(messages).length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p
                className="text-sm text-foreground-muted"
                style={{ color: "var(--foreground-muted)" }}
              >
                Brak wiadomośći. Zacznij rozmowę!
              </p>
            </div>
          ) : (
            <>
              {Object.entries(messages).map(([dateKey, dateMessages]) => (
                <div key={dateKey}>
                  {/* Date label */}
                  <div className="flex items-center justify-center my-4">
                    <span
                      className="text-xs px-3 py-1 rounded-full"
                      style={{
                        background: "var(--surface-input)",
                        color: "var(--foreground-secondary)",
                      }}
                    >
                      {formatMessageDate(dateKey)}
                    </span>
                  </div>

                  {/* Messages for this date */}
                  <ul className="flex flex-col gap-0.5 mb-1">
                    {dateMessages.map((msg) => {
                      {
                        /* TODO: Wprowadzić isSending */
                        /* const isSending = sendingSet.has( */
                        /*   msg.clientMessageId || "", */
                        /* ); */
                      }
                      return (
                        <li
                          key={msg.id || msg.clientMessageId || Math.random()}
                          className={`${isOwn(msg) ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`${isOwn(msg) ? "flex-row-reverse" : "flex-row"}`}
                          >
                            <MessageBubble
                              message={{
                                ...msg,
                                username: isOwn(msg)
                                  ? null
                                  : otherMember?.username,
                              }}
                              isOwn={isOwn(msg)}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {/* Scroll-to-bottom button */}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ background: "rgba(8,9,13,0.5)" }}
          >
            <svg
              aria-label="Loading"
              className="w-6 h-6 text-primary animate-spin"
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
          </div>
        )}
      </div>

      {/* Message input */}
      <MessageInput onSend={handleSend} />
    </div>
  );
}
