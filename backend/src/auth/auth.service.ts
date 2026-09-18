import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { and, eq, or, sql } from "drizzle-orm";
import type { AuthUser, RegisterValues } from "shared";
import { DatabaseService } from "../db/database.service";
import { sessions, users } from "../db/schema";

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterValues) {
    const existing = await this.databaseService.db
      .select()
      .from(users)
      .where(or(eq(users.email, dto.email), eq(users.username, dto.username)))
      .limit(1);

    if (existing.length) {
      throw new ConflictException("Username or email already exists.");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const [newUser] = await this.databaseService.db
      .insert(users)
      .values({
        username: dto.username,
        email: dto.email,
        passwordHash,
      })
      .returning();

    const { passwordHash: _, ...result } = newUser;
    return result;
  }

  async login(
    username: string,
    password: string,
    deviceName: string,
    sessionUuid: string,
  ): Promise<{ token: string; username: string; userId: number }> {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      throw new ConflictException("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new ConflictException("Invalid credentials");
    }

    const [existingSession] = await this.databaseService.db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.sessionUuid, sessionUuid),
          eq(sessions.userId, user.id),
        ),
      );

    let newSessionId: number;

    if (!existingSession) {
      const [newSession] = await this.databaseService.db
        .insert(sessions)
        .values({
          userId: user.id,
          deviceName,
          lastUsedAt: sql`datetime('now')`,
          sessionUuid,
        })
        .returning();

      newSessionId = newSession.id;
    } else {
      await this.databaseService.db
        .update(sessions)
        .set({ lastUsedAt: sql`datetime('now')` })
        .where(eq(sessions.id, existingSession.id));
    }

    return {
      token: this.jwtService.sign({
        sub: user.id,
        username: user.username,
        sessionId: existingSession ? existingSession.id : newSessionId,
      }),
      userId: user.id,
      username: user.username,
    };
  }

  async sessions(user: AuthUser) {
    return await this.databaseService.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, user.id));
  }

  async removeSession(params: string, sessionId: number) {
    const id = parseInt(params, 10);
    if (id === sessionId) {
      throw new BadRequestException("Cannot delete current session");
    }

    return await this.databaseService.db
      .delete(sessions)
      .where(eq(sessions.id, id));
  }
}
