interface EmptyStateProps {
  onBack?: () => void;
}

export default function EmptyState({ onBack }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-8 text-center">
      <div
        className="shrink-0 w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ background: "var(--surface-input)" }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          className="w-10 h-10"
          style={{ color: "var(--foreground-secondary)" }}
        >
          <path d="M7.9 20L2 12V4a1 1 0 0 1 1-1h4l3 3h8a1 1 0 0 1 1 1v9" />
          <path d="M4 12H2m20 0h-2m-5 6h-8L5 17h12Z" />
        </svg>
      </div>
      <p
        className="text-sm font-medium mb-1"
        style={{ color: "var(--foreground-primary)" }}
      >
        Wybierz konwersację
      </p>
      <p className="text-xs text-foreground-muted mb-6 max-w-60">
        Lub zacznij nową rozmowę, wybierając użytkownika z listy.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-medium rounded-md px-4 py-2 transition-colors hover:bg-hover active:bg-active"
        style={{
          background: "var(--surface-input)",
          color: "var(--foreground-primary)",
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="w-3.5 h-3.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Nowa konwersacja
      </button>
    </div>
  );
}
