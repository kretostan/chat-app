import { useState } from "react";
import type { ChatRoomDetails, PaginatedRooms } from "shared";
import ConversationList from "./ConversationList";
import MenuHeader from "./MenuHeader";
import SearchInput from "./SearchInput";

interface MenuProps {
  currentUserId: number;
  data: PaginatedRooms;
  activeRoomId: number | null;
  onSelect: (roomId: number) => void;
  onNewConversation: () => void;
}

export default function Menu({
  currentUserId,
  data,
  activeRoomId,
  onSelect,
  onNewConversation,
}: MenuProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filterByUser = (room: ChatRoomDetails): boolean => {
    if (!searchQuery.trim()) return true;
    for (const member of room.members) {
      if (member.username.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
    }
    if (
      room.lastMessage?.content
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return true;
    }
    return false;
  };

  const filteredRooms = data.rooms.filter(filterByUser);

  return (
    <div
      className="flex flex-col h-full w-full"
      style={{ background: "var(--color-surface-section)" }}
    >
      <MenuHeader onNewConversation={onNewConversation} />
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        onNewConversation={onNewConversation}
      />
      <ConversationList
        currentUserId={currentUserId}
        rooms={filteredRooms}
        activeRoomId={activeRoomId}
        onSelect={onSelect}
      />
    </div>
  );
}
