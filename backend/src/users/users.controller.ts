import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("/search")
  @UseGuards(JwtAuthGuard)
  async findUsers(@Query("q") query: string) {
    return this.usersService.findUsers(query);
  }
}
