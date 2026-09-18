import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { and, eq } from "drizzle-orm";
import { Strategy } from "passport-jwt";
import { DatabaseService } from "../db/database.service";
import { sessions, users } from "../db/schema";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private databaseService: DatabaseService) {
    super({
      jwtFromRequest: (req) => req?.cookies?.access_token ?? null,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? "super-secret",
    });
  }

  async validate(payload: {
    sub: number;
    username: string;
    sessionId: number;
  }) {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(
        and(eq(users.username, payload.username), eq(users.id, payload.sub)),
      );

    if (!user) throw new UnauthorizedException();

    const [session] = await this.databaseService.db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, payload.sub),
          eq(sessions.id, payload.sessionId),
        ),
      );

    if (!session) throw new UnauthorizedException();

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      sessionId: session.id,
    };
  }
}
