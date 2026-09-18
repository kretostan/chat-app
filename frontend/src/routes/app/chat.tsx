import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { PaginatedRooms, PublicUser } from "shared";
import Content from "@/components/app/content/Content";
import EmptyState from "@/components/app/content/EmptyContent";
import Menu from "@/components/app/menu/Menu";
import NewConversationModal from "@/components/app/menu/NewConversationModal";
import { MessageListSkeleton } from "@/components/app/messages/Skeleton";
import { useMobile } from "@/hooks/useMobile";
import { useCurrentTheme } from "@/hooks/useThemeContext";

export const Route = createFileRoute("/app/chat")({
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
});

function RouteComponent() {
  const isMobile = useMobile();
  const { user, roomsData } = Route.useLoaderData();
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { theme: currentTheme } = useCurrentTheme();

  // Show skeleton on initial load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleNewConversation = useCallback(() => {
    setShowNewConversation(true);
  }, []);

  const handleLogoutDesktop = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.navigate({ to: "/" });
  };

  const handleRoomSelect = useCallback((id: number) => {
    setSelectedRoomId(id);
    // On mobile, closing menu happens via Content's back button
  }, []);

  // FIX: Po wybraniu rooma scrolluje całą stronę na dół, a nie tylko sam div z roomem
  // FIX: Nie działa paginacja. Prawdopodobnie została źle zaimplementowana. Nie wczytuje starszych roomów/wiadomości

  return (
    <div className="flex mt-20 h-screen w-screen bg-surface-base">
      {/* Mobile header overlay */}
      {isMobile && (
        <div
          className="fixed top-0 left-0 right-0 z-10 h-16 flex items-center justify-between px-4"
          style={{
            background: "var(--surface-footer)",
            borderBottom: `1px solid var(--border-default)`,
          }}
        >
          <h1 className="text-lg font-semibold">Wiadomości</h1>
          <div className="flex items-center gap-2">
            <Link
              to="/app/settings"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-hover active:bg-active transition-colors"
              aria-label="Settings"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                className="w-5 h-5 text-foreground-secondary"
                aria-hidden="true"
              >
                <path
                  d="M9 17V6h6v5.01m-8.5 0h4.5M6 8.5h.01M15.5 8.5H20M11 21h2a3 3 0 003-3v-7H8v7a3 3 0 003 3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              to="/app/settings"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-hover active:bg-active transition-colors"
              aria-label="Motyw"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                className="w-5 h-5 text-foreground-secondary"
                aria-hidden="true"
              >
                {currentTheme === "system" ? (
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <>
                    <circle cx="12" cy="12" r="5" />
                    <path
                      d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}
              </svg>
            </Link>
            <button
              type="button"
              onClick={handleNewConversation}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-hover active:bg-active transition-colors"
              aria-label="Nowa konwersacja"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="w-5 h-5 text-primary"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button
              type="button"
              className="hover:text-tertiary cursor-pointer"
              onClick={async () => {
                await fetch("/api/auth/logout", {
                  method: "POST",
                  credentials: "include",
                });
                window.location.href = "/";
              }}
            >
              Logout ({user.username})
            </button>
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden flex-col">
        {/* Desktop navigation bar */}
        {!isMobile && (
          <div
            className="flex justify-between items-center shrink-0"
            style={{
              background: "var(--surface-base)",
              borderInlineEnd: `1px solid var(--border-default)`,
            }}
          >
            <p className="text-sm text-foreground-secondary">
              Witaj, <span className="text-primary">{user.username}</span>!
            </p>
            <div className="flex items-center px-4 pb-4">
              <Link
                to="/app/settings"
                className="block my-3 px-4 py-2 text-sm font-medium rounded-lg hover:bg-hover transition-colors"
                style={{ color: "var(--foreground-primary)" }}
              >
                Settings
              </Link>
              <motion.button
                type="button"
                initial={{ color: "var(--foreground-primary)" }}
                whileHover={{ color: "var(--tertiary)" }}
                className="px-1 cursor-pointer text-sm"
                onClick={handleLogoutDesktop}
              >
                Logout
              </motion.button>
            </div>
          </div>
        )}
        {loading ? (
          // Skeleton loader for menu
          <div
            className="shrink-0 w-80 border-r"
            style={{
              background: "var(--surface-section)",
              borderColor: "var(--border-default)",
            }}
          >
            <MessageListSkeleton count={12} />
          </div>
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
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  Wybierz konwersację
                </p>
              </div>
              {/* Mobile menu as full-screen overlay */}
              {showNewConversation && (
                <div
                  className="absolute inset-0 z-20 flex items-end justify-center"
                  style={{ background: "rgba(8,9,13,0.5)" }}
                >
                  <NewConversationModal
                    onClose={() => setShowNewConversation(false)}
                  />
                </div>
              )}
            </>
          )
        ) : (
          // Desktop: side-by-side menu + chat area
          <>
            <div
              className="shrink-0 w-80 border-r overflow-hidden"
              style={{
                background: "var(--surface-section)",
                borderColor: "var(--border-default)",
              }}
            >
              <Menu
                currentUserId={user.id}
                data={roomsData}
                activeRoomId={selectedRoomId}
                onSelect={handleRoomSelect}
                onNewConversation={handleNewConversation}
              />
            </div>
            {selectedRoomId ? (
              <>
                {/* Menu sidebar */}
                {/* Chat panel */}
                <Content
                  roomId={selectedRoomId}
                  roomsData={roomsData}
                  user={user}
                />
              </>
            ) : (
              // Empty state when no chat selected
              <div
                className="flex-1 flex flex-col items-center justify-center"
                style={{ background: "var(--color-surface-section)" }}
              >
                <EmptyState onBack={() => setShowNewConversation(true)} />
              </div>
            )}
            {/* New Conversation Modal */}
            {showNewConversation && (
              <div
                className="fixed inset-0 z-20 flex items-center justify-center"
                style={{ background: "var(--overlay-default)" }}
              >
                <NewConversationModal
                  onClose={() => setShowNewConversation(false)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
