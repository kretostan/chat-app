import Add from "@/assets/add-mark.svg?react";
import Profile from "@/assets/profile.svg?react";

interface MobileProps {
  onNewConversation: () => void;
}

export default function Mobile({ onNewConversation }: MobileProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onNewConversation}
        className="rounded-full flex items-center justify-center hover:bg-hover active:bg-active transition-colors"
      >
        <Add height={14} width={14} />
        Nowa
      </button>
      <button
        type="button"
        className="flex justify-center items-center h-8 w-8 hover:text-tertiary border-2 cursor-pointer rounded-full"
      >
        <Profile />
      </button>
    </div>
  );
}
