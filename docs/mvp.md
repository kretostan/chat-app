# MVP – Chat App

## Cel

I am building a lightweight, real-time messaging app designed for instant
information exchange without unnecessary distractions or complex configuration.

## MVP (Version 0.1 - Core)

- [ ] User can sign up / log in.
- [ ] User can view a list of active conversations.
- [ ] User can open a chat and view message history.
- [ ] User can send messages.
- [ ] Real-time message delivery (Socket.io).

## MVP (Version 0.2 - Multimedia)

- [ ] User can initiate an audio call.
- [ ] User can initiate a video call.

## User Stories (v0.1)

- As a user, I want to create an account and log in securely so that
my conversations remain private and accessible only to me.
- As a user, I want to see a list of active chat threads
so I can quickly switch between different conversations.
- As a user, I want to receive messages instantly so that the
conversation feels fluid and natural.
- As a user, I want my chat history to persist after logging back in
so I don't lose important information.

## User Stories (v0.2)

- As a user, I want to start an audio call with a contact
so I can communicate quickly without typing.
- As a user, I want to initiate a video call
so I can have a face-to-face conversation and see the other person's reactions.

## Out of Scope (Backlog)

- [ ] Read receipts.
- [ ] Typing indicators.
- [ ] File attachments.
- [ ] Message search functionality.
- [ ] Push notifications.

## Non-Functional Requirements (NFR)

### Security

- Authentication: JWT (AccessToken stored in HttpOnly Cookie)
to ensure secure sessions without frequent re-logging.
  - Refresh token: backlog (post-v0.1) — see `docs/todo.md` Backlog.
- Authorization: Resource-level access control (Middleware)
to verify if the `user_id` from the token is authorized to access a specific `chat_id`.
- Rate Limiting:
  - Login/Register: 5 attempts per 15 minutes (Brute Force protection).
  - Messaging: Max 5 messages per second (Spam prevention).

### Performance / UX

- Message Size Limit: 4,000 characters
(to prevent database bloat and ensure fast rendering).
- Pagination: Cursor-based pagination to avoid skipping messages
when new ones arrive during scrolling.
- Offline/Reconnect: "Reconnecting..." UI state + Optimistic UI
(messages appear immediately in a "pending" state before server confirmation).

### Operations

- Logging:
  - Log: 500 errors, unauthorized access attempts, key endpoint response times.
  - Do NOT log: Passwords, message content (PII), or raw JWT tokens.
- DB Migrations: Drizzle Migrate for rapid prototyping and schema consistency.
- Monitoring: Health-check endpoint (/health), basic logs (CloudWatch/Loki),
and uptime monitoring (e.g., UptimeRobot).
