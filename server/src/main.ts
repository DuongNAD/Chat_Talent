import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS — hỗ trợ cả localhost dev và Cloudflare Tunnel domain
  const tunnelUrl = process.env['TUNNEL_URL'];
  const allowedOrigins: (string | RegExp)[] = [
    'http://localhost:1420',  // Vite dev
    'http://localhost:3000',  // Self
    'tauri://localhost',      // Tauri app
    'https://tauri.localhost',
  ];

  if (tunnelUrl) {
    allowedOrigins.push(tunnelUrl);
    // Cho phép tất cả subdomain .trycloudflare.com (Quick Tunnel)
    allowedOrigins.push(/\.trycloudflare\.com$/);
  }

  app.enableCors({
    origin: tunnelUrl ? true : allowedOrigins, // Quick Tunnel = accept all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
  });

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);

  console.log(`🚀 Chat Talent server running on http://localhost:${port}`);
  console.log(`❤️  Health check: http://localhost:${port}/api/health`);
  if (tunnelUrl) {
    console.log(`🌍 Tunnel URL: ${tunnelUrl}`);
  }
}

bootstrap();
