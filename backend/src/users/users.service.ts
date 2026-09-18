import { Injectable } from "@nestjs/common";
import { like } from "drizzle-orm";
import { users } from "src/db/schema";
import { DatabaseService } from "../db/database.service";

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}

  async findUsers(query: string) {
    return await this.databaseService.db
      .select({
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(like(users.username, `${query}%`));
  }
}
