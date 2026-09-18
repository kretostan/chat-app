export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const today = new Date();
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

export function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr);

  // Today
  if (date.toDateString() === today.toDateString()) return "Today";
  // Yesterday
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  // This week
  const diffDays = Math.floor(
    (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 7) {
    return date.toLocaleDateString("pl-PL", { weekday: "long" });
  }

  // Older
  return date.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
}

export function formatLastMessageAt(isoStr: string | null): string {
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

  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return date.toLocaleDateString("pl-PL", { weekday: "long" });
  if (diffDays < 30)
    return date.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });

  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "2-digit",
    year: "2-digit",
  });
}
