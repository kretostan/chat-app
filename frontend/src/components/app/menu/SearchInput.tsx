interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  onNewConversation: () => void;
}

export default function SearchInput({
  value,
  onChange,
  onNewConversation,
}: SearchInputProps) {
  return (
    <div className="px-2 py-1.5 flex">
      <button
        onClick={onNewConversation}
        aria-label="Nowa rozmowa"
        type="button"
        className="shrink-0 flex items-center justify-center h-8.5 w-8.5 rounded-full hover:bg-hover active:bg-active transition-colors text-primary"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="w-5 h-5"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <input
        type="text"
        className="flex-1 ml-3 bg-transparent text-sm outline-none placeholder:text-muted/60"
        style={{ color: "var(--foreground-primary)" }}
        placeholder="Szukaj..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
