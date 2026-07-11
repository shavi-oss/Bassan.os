import { NestFactory } from "@nestjs/core";
import { ValidationPipe, RequestMethod } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers (lightweight, dependency-free)
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains",
    );
    next();
  });

  // Enable Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ALLOWED_ORIGINS
      ? process.env.CORS_ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3000"],
    credentials: true,
  });

  // Set Global Prefix (api/v1 for all routes except admin sub-app)
  // PR-101: admin routes use absolute path /api/v2/admin/* and must be
  // excluded from the api/v1 prefix to avoid double-prefixing.
  app.setGlobalPrefix("api/v1", {
    exclude: [{ path: "api/v2/admin/:path*", method: RequestMethod.ALL }],
  });

  const port = parseInt(process.env.PORT || "3000", 10);
  await app.listen(port, "0.0.0.0");
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
