import { createFileRoute, redirect } from "@tanstack/react-router";
import type { PaginatedRooms, PublicUser } from "shared";

export const Route = createFileRoute("/app/chat/$chatId")({
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
  // TODO: Dodać roomy po nawigacji
  return;
}
