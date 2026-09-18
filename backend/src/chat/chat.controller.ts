import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import {
  type AuthUser,
  type MessagesPagination,
  messagesPaginationSchema,
  type RoomsPagination,
  roomsPaginationSchema,
} from "shared";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ZodValidationPipe } from "src/common/pipes/zod-validation.pipe";
import { ChatService } from "./chat.service";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("/rooms")
  @UseGuards(JwtAuthGuard)
  async loadRooms(
    @CurrentUser() user: AuthUser,
    @Query(new ZodValidationPipe(roomsPaginationSchema))
    params: RoomsPagination,
  ) {
    return await this.chatService.loadRooms(
      user.id,
      params.cursor,
      params.limit,
    );
  }

  @Get("/rooms/:id")
  @UseGuards(JwtAuthGuard)
  async loadRoom(@CurrentUser() user: AuthUser, @Param("id") roomId: string) {
    return await this.chatService.loadRoomDetails(+roomId, user.id);
  }

  @Get("/rooms/:id/messages")
  @UseGuards(JwtAuthGuard)
  async loadMessages(
    @CurrentUser() user: AuthUser,
    @Param("id") roomId: string,
    @Query(new ZodValidationPipe(messagesPaginationSchema))
    params: MessagesPagination,
  ) {
    return await this.chatService.loadMessages(
      +roomId,
      user.id,
      params.cursor,
      params.limit,
    );
  }
}
