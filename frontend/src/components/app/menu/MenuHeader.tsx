interface MenuHeaderProps {
  onNewConversation: () => void;
}

export default function MenuHeader({ onNewConversation }: MenuHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-5 h-20"
      style={{ background: "var(--color-surface-footer)" }}
    >
      <div>
        <h3 className="text-lg font-semibold">Wiadomości</h3>
        <p className="text-xs text-foreground-secondary/70">
          Początek rozmowy z kimś
        </p>
      </div>
      <button
        type="button"
        onClick={onNewConversation}
        aria-label="Rozpocznij nową konwersację"
        className="flex justify-center items-center h-9 w-9 hover:bg-hover active:bg-active rounded-full transition-colors"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="w-5 h-5 text-foreground-secondary"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
