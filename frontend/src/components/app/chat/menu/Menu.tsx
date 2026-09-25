import { useState } from "react";
import type { ChatRoomDetails, PaginatedRooms } from "shared";
import Filter from "@/components/app/chat/menu/Filter";
import SearchInput from "@/components/app/chat/menu/SearchInput";
import ConversationList from "./ConversationList";

interface MenuProps {
  currentUserId: number;
  data: PaginatedRooms;
  activeRoomId: number | null;
  onSelect: (roomId: number) => void;
}

export default function Menu({
  currentUserId,
  data,
  activeRoomId,
  onSelect,
}: MenuProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    <div className="flex flex-col gap-3 p-4 w-full md:w-80">
      <div>
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
        <Filter />
        <h3 className="text-sm uppercase">Aktywne rozmowy</h3>
      </div>
      <ConversationList
        currentUserId={currentUserId}
        rooms={filteredRooms}
        activeRoomId={activeRoomId}
        onSelect={onSelect}
      />
    </div>
  );
}
