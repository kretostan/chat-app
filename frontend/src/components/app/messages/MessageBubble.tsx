import type { RoomMessage } from "shared";

export default function MessageBubble({
  message,
  isOwn,
}: {
  message: RoomMessage & { username: string | null | undefined };
  isOwn: boolean;
}) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString(
    "pl-PL",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <div
      className={`flex items-end gap-2 w-full ${isOwn ? "justify-end" : "justify-start"} mb-0.5`}
    >
      {/* Avatar for other user's first message in a group */}
      {!isOwn && (
        <div className="w-7 h-7 rounded-full bg-surface-section flex items-center justify-center shrink-0 text-xs font-medium text-foreground-secondary border border-border-default">
          {message.username?.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[65%] ${isOwn ? "" : "text-left"}`}>
        <div
          className="relative px-3 py-2.5 text-sm leading-snug wrap-break-word whitespace-pre-wrap"
          style={{
            background: isOwn
              ? "var(--surface-message-answer)"
              : "var(--surface-section)",
            color: isOwn ? "#ffffff" : "var(--foreground-primary)",
            borderRadius: isOwn
              ? "16px 16px 4px 16px" // right-aligned bubbles: rounded top, flat left-bottom
              : "16px 16px 16px 4px", // left-aligned bubbles: flat right-bottom
          }}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <div
          className="flex items-center gap-1 px-1 mt-0.5 text-[11px]"
          style={{
            color: isOwn ? "rgba(255,255,255,0.4)" : "var(--foreground-muted)",
          }}
        >
          <span>{formattedTime}</span>
          {/* Read receipt (when backend supports it) */}
          {message.clientMessageId && isOwn && (
            <svg
              aria-label="Message read"
              className="w-3 h-3"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M12.78 4.22a.75.75 0 1 0-1.06 1.06L12.19 6l-3.19 3.19a.75.75 0 0 1-1.06 0L4.38 6.06A.75.75 0 1 0 3.32 7.12l3.69 3.69a.75.75 0 0 0 1.06 0L13.44 5.28a.75.75 0 0 0-.66-1.06Z" />
              <path
                d="M.5 5.5A4 4 0 0 1 4.5 1.5l1.59 1.59L4.5 4.28A2.25 2.25 0 0 0 .5 5.5Zm4 0a2.25 2.25 0 0 1 3.8-1.72l.67.66L7.69 6A3.75 3.75 0 0 0 .5 5.5Z"
                opacity="0.4"
              />
              <path
                d="M.5 8.5a4.5 4.5 0 0 1 1.72-3.59l.69.69A3.006 3.006 0 0 0 .5 8.5Zm5.44 1.92a.75.75 0 0 0 1.06-1.06l-.87-.87.42-.42a.75.75 0 1 0-1.06-1.06l-1 1a.75.75 0 0 0 0 1.06l1.45 1.35Z"
                opacity="0.4"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
