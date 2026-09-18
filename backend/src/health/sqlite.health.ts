import { Injectable } from "@nestjs/common";
import { HealthIndicatorService } from "@nestjs/terminus";
import { DatabaseService } from "src/db/database.service";

@Injectable()
export class SqliteHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly databaseService: DatabaseService,
  ) {}

  isHealthy(key: string) {
    return this.healthIndicatorService.check(key).attempt(async () => {
      this.databaseService.ping();
    });
  }
}
