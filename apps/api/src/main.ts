import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { DatabaseExceptionFilter } from './common/filters/database-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security & Performance
  app.use(helmet());
  app.use(compression());
  app.enableCors();
  app.useGlobalFilters(new DatabaseExceptionFilter());

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('SplitNest API')
    .setDescription('The SplitNest backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
