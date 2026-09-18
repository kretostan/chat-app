import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { ChatController } from "./chat.controller";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { WsService } from "./ws.service";

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, WsService],
})
export class ChatModule {}
