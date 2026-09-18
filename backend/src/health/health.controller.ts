import { Controller, Get } from "@nestjs/common";
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from "@nestjs/terminus";
import { SqliteHealthIndicator } from "./sqlite.health";

@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly sqlite: SqliteHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () =>
        this.disk.checkStorage("disk_space", {
          path: "/",
          thresholdPercent: 0.8,
        }),
      () => this.memory.checkHeap("memory_heap", 200 * 1024 * 1024),
      () => this.sqlite.isHealthy("database"),
    ]);
  }
}
