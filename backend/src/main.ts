import fastifyCookie, { FastifyCookieOptions } from "@fastify/cookie";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { WsAdapter } from "@nestjs/platform-ws";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const PORT = process.env.PORT ?? 3001;

  app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET ?? "super-secret",
  } as FastifyCookieOptions);
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  });

  app.useWebSocketAdapter(
    new WsAdapter(app, {
      // To handle messages in the [event, data] format
      messageParser: (data) => {
        const [event, payload] = JSON.parse(data.toString());
        return { event, data: payload };
      },
    }),
  );

  app.setGlobalPrefix("api");
  await app.listen(PORT, "0.0.0.0");
}

bootstrap();
