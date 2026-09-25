import { useEffect, useRef, useState } from "react";

interface MessageInputProps {
  onSend: (message: string) => void;
  loading?: boolean;
}

export default function MessageInput({
  onSend,
  loading = false,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && text.length === 0) {
      textareaRef.current.style.height = "auto";
    } else if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="flex items-end gap-2 p-4 border-t"
      style={{
        background: "var(--surface-footer)",
        borderColor: "var(--border-default)",
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Napisz wiadomość…"
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm text-foreground-primary placeholder:text-foreground-muted/60 outline-none border-none"
        style={{ maxHeight: 160, lineHeight: "1.5" }}
        disabled={loading}
      />
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={!text.trim() || loading}
        className="shrink-0 h-8 px-3 text-xs font-medium rounded-md transition-opacity duration-200"
        style={{
          background: "var(--primary)",
          opacity: !text.trim() || loading ? 0.4 : 1,
          cursor: !text.trim() || loading ? "default" : "pointer",
          color: "#08090d",
        }}
      >
        Wyślij
      </button>
    </div>
  );
}
