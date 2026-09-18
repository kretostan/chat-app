import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Injectable, type OnModuleInit } from "@nestjs/common";
import Database from "better-sqlite3";
import {
  type BetterSQLite3Database,
  drizzle,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

@Injectable()
export class DatabaseService implements OnModuleInit {
  public db: BetterSQLite3Database<typeof schema>;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL ?? "file:./data/chat.db";
    const filePath = databaseUrl.replace("file:", "");
    mkdirSync(dirname(filePath), { recursive: true });
    const sqlite = new Database(filePath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    this.db = drizzle(sqlite, { schema });
  }

  async onModuleInit() {
    migrate(this.db, { migrationsFolder: "drizzle" });
  }

  ping(): void {
    this.db.run("SELECT 1");
  }
}
