# API (REST) – Roadmap

## Security

- **Mechanism:** JWT (AccessToken stored in HttpOnly Cookie). JWT includes `sessionId` — logout invalidates only that session.
- **CSRF:** Protection planned (not yet implemented).
- **Error Codes:** - `401 Unauthorized`: Missing or expired token.
  - `403 Forbidden`: User is not a member of the requested chat room.

## Endpoints (MVP)

### Auth

- `POST /auth/register` – Create a new account.
- `POST /auth/login` – Establish session (sets cookie, creates `sessions` record).
- `POST /auth/logout` – Clear session cookie, invalidate current device session.
- `POST /auth/logout-all` – Invalidate all sessions for the current user.
- `GET /auth/sessions` – List active sessions for the current user (includes `isCurrent` flag).
- `DELETE /auth/sessions/:id` – Invalidate a specific session (remote logout of another device).

### Users

- `GET /users/profile` – Retrieve the current user's profile.
- `GET /users/search?q=...` – Find users to start a new conversation.

### Chat rooms

- `GET /chat-rooms` – List all chats for the authenticated user.
- `GET /chat-rooms/:id/messages?cursor=...&limit=20` – Retrieve chat history
(cursor-based).

## Conventions

- **Pagination:** `cursor` (Base64 string containing `created_at` and `id`).
- **Body Limits:** Maximum **4,000** characters for message bodies.
- **Write operations** (send message, create room) go through WebSocket only.
