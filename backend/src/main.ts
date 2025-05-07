import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'body-parser'; // Import body-parser json middleware

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase the JSON payload limit (e.g., to 5MB)
  // Adjust the limit ('5mb') as needed for your data size
  app.use(json({ limit: '5mb' }));

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Tutor‑Link API')
    .setDescription('Tutor‑Link backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, swaggerDoc);

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const host = `0.0.0.0`;
  await app.listen(port, host);
}
bootstrap();
