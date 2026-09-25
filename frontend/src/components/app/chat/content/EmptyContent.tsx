import Add from "@/assets/add-mark.svg?react";
import Folder from "@/assets/folder.svg?react";

interface EmptyStateProps {
  onBack?: () => void;
}

export default function EmptyState({ onBack }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-8 text-center">
      <div className="shrink-0 w-24 h-24 bg-surface-input rounded-full flex items-center justify-center mb-6">
        <Folder />
      </div>
      <p className="text-foreground-primary text-sm font-medium mb-1">
        Wybierz konwersację
      </p>
      <p className="text-xs text-foreground-muted mb-6 max-w-60">
        Lub zacznij nową rozmowę, wybierając użytkownika z listy.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 bg-surface-input text-foreground-primary text-xs font-medium rounded-md px-4 py-2 transition-colors hover:bg-hover active:bg-active"
      >
        <Add height={16} width={16} />
        Nowa konwersacja
      </button>
    </div>
  );
}
