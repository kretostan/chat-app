import { redirect } from "@tanstack/react-router";

export async function authenticate() {
  const response = await fetch("/api/auth/profile");
  if (response.ok) throw redirect({ to: "/app/chat" });
}
