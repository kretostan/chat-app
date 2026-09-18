import { CanActivate, ExecutionContext } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Observable } from "rxjs";

export class WsJwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client = context.switchToWs().getClient();
    if (!client.user) throw new WsException("Unauthorized");
    return true;
  }
}
