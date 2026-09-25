const MessageBubbleSkeleton = () => (
  <div className="flex items-end gap-2 w-full mb-1 animate-pulse">
    <div className="w-7 h-7 rounded-full bg-border-default shrink-0" />
    <div
      style={{ background: "var(--surface-section)" }}
      className="h-9 flex-1 min-w-24 max-w-[65%] rounded-2xl"
    />
  </div>
);

const MessageListSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="flex flex-col flex-1 p-4">
    {Array.from({ length: count }, () => (
      <MessageBubbleSkeleton key={crypto.randomUUID()} />
    ))}
  </div>
);

const LoadingOverlay = () => (
  <div
    className="absolute inset-0 flex items-center justify-center"
    style={{ background: "rgba(8,9,13,0.7)" }}
  >
    <svg
      aria-hidden="true"
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
);

export { LoadingOverlay, MessageListSkeleton };
