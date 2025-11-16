import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './infrastructure/auth/SeedService';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seed admin user
  const seedService = app.get(SeedService);
  await seedService.seedAdmin();

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Core API')
    .setDescription('API documentation for Core Banking System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
