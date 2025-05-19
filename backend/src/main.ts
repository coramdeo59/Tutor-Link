import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Explicitly type the app as NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Allow requests from any origin in development mode
  app.enableCors({
    origin: true, // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  
  // Configure Express to handle file uploads
  // Additional CORS headers for file uploads
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*'); // Dynamic origin
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Tutor-Link API')
    .setDescription('The Tutor-Link API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
  const host = `0.0.0.0`;
  await app.listen(port, host);
}
bootstrap();