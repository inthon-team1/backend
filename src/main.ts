import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from 'src/app.module';
import { HttpExceptionFilter } from 'src/exceptions/httpExceptionFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('inthon api')
    .setDescription('inthon api')
    .setVersion('1.0')
    .build();
  app.enableCors();
  const docs = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, docs);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(8888);
}
bootstrap();
