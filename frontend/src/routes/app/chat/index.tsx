import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import type { PaginatedRooms, PublicUser } from "shared";
import Content from "@/components/app/chat/content/Content";
import EmptyState from "@/components/app/chat/content/EmptyContent";
import Menu from "@/components/app/chat/menu/Menu";
import NewConversationModal from "@/components/app/chat/menu/NewConversationModal";
import { MessageListSkeleton } from "@/components/app/chat/messages/Skeleton";
import Desktop from "@/components/app/navigation/Desktop";
import Mobile from "@/components/app/navigation/Mobile";
import Navigation from "@/components/layout/navigation/Navigation";
import { useMobile } from "@/hooks";

export const Route = createFileRoute("/app/chat/")({
  beforeLoad: async () => {
    const response = await fetch("/api/auth/profile");
    if (!response.ok) throw redirect({ to: "/auth/login" });
  },
  loader: async (): Promise<{
    user: PublicUser;
    roomsData: PaginatedRooms;
  }> => {
    const [userResponse, roomsResponse] = await Promise.all([
      fetch("/api/auth/profile"),
      fetch("/api/chat/rooms"),
    ]);

    if (!userResponse.ok) throw redirect({ to: "/auth/login" });
    if (!roomsResponse.ok)
      throw new Error(`Rooms fetch failed: ${roomsResponse.status}`);

    const [user, roomsData] = await Promise.all([
      userResponse.json(),
      roomsResponse.json(),
    ]);

    return { user, roomsData };
  },
  component: RouteComponent,
  errorComponent: () => <div>Error</div>,
  notFoundComponent: () => <div>Not Found 404</div>,
});

function RouteComponent() {
  const isMobile = useMobile();
  const { user, roomsData } = Route.useLoaderData();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [loading, setLoading] = useState(true);

  // Show skeleton on initial load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleRoomSelect = useCallback((id: number) => {
    setSelectedRoomId(id);
    // On mobile, closing menu happens via Content's back button
  }, []);

  // FIX: Po wybraniu rooma scrolluje całą stronę na dół, a nie tylko sam div z roomem
  // FIX: Nie działa paginacja. Prawdopodobnie została źle zaimplementowana. Nie wczytuje starszych roomów/wiadomości

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <Navigation>
        {isMobile ? (
          <Mobile onNewConversation={() => setShowNewConversation(true)} />
        ) : (
          <Desktop username={user.username} />
        )}
      </Navigation>
      {/* Main area */}
      <div className="flex justify-center my-6 w-full md:max-w-350 bg-[#11131A] rounded-2xl overflow-hidden">
        {loading ? (
          <MessageListSkeleton count={12} />
        ) : isMobile ? (
          // Mobile: show either menu overlay or chat content
          selectedRoomId ? (
            <Content
              roomId={selectedRoomId}
              roomsData={roomsData}
              user={user}
              onBack={() => setSelectedRoomId(null)}
            />
          ) : (
            <>
              {roomsData.rooms.length ? (
                <Menu
                  currentUserId={user.id}
                  data={roomsData}
                  activeRoomId={selectedRoomId}
                  onSelect={handleRoomSelect}
                />
              ) : (
                <EmptyState onBack={() => setShowNewConversation(true)} />
              )}
              {/* Mobile menu as full-screen overlay */}
              {showNewConversation && (
                <NewConversationModal
                  onClose={() => setShowNewConversation(false)}
                />
              )}
            </>
          )
        ) : (
          // Desktop: side-by-side menu + chat area
          <>
            <Menu
              currentUserId={user.id}
              data={roomsData}
              activeRoomId={selectedRoomId}
              onSelect={handleRoomSelect}
            />
            {selectedRoomId ? (
              <Content
                roomId={selectedRoomId}
                roomsData={roomsData}
                user={user}
                onBack={() => setSelectedRoomId(null)}
              />
            ) : (
              <EmptyState onBack={() => setShowNewConversation(true)} />
            )}
          </>
        )}
        {showNewConversation && (
          <NewConversationModal onClose={() => setShowNewConversation(false)} />
        )}
      </div>
    </div>
  );
}
