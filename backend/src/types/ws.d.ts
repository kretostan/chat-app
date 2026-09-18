import { AuthUser } from "shared";

declare module "ws" {
  interface WebSocket {
    user?: AuthUser;
  }
}
