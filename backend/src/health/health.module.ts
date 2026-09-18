import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { SqliteHealthIndicator } from "./sqlite.health";

@Module({
  controllers: [HealthController],
  imports: [TerminusModule],
  providers: [SqliteHealthIndicator],
})
export class HealthModule {}
