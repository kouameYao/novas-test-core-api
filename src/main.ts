import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './infrastructure/auth/SeedService';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './infrastructure/filters/HttpExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      // Autorise toutes les origines (y compris Postman, mobile, no-origin)
      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    exposedHeaders: '*',
    credentials: true, // si tu utilises Authorization ou cookies
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Seed admin
  const seedService = app.get(SeedService);
  await seedService.seedAdmin();

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Core API')
    .setDescription('API documentation for Core Banking System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 8080;
  await app.listen(port);
}
bootstrap();
