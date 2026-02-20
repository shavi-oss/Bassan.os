import { NestFactory } from "@nestjs/core";
import { ValidationPipe, RequestMethod } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Set Global Prefix (api/v1 for all routes except admin sub-app)
  // PR-101: admin routes use absolute path /api/v2/admin/* and must be
  // excluded from the api/v1 prefix to avoid double-prefixing.
  app.setGlobalPrefix("api/v1", {
    exclude: [{ path: "api/v2/admin/:path*", method: RequestMethod.ALL }],
  });

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
