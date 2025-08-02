import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Get environment variables
  const port = configService.get<number>('PORT', 3000);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS', frontendUrl)
    .split(',')
    .map(origin => origin.trim());
  
  // Enable CORS for frontend communication
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();