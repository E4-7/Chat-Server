import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { WsExceptionFilter } from './common/filters/ws-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { LoggerService } from './modules/logger/logger.service';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const logger = new LoggerService('[main.ts]');
  const PORT = configService.get('app.port') || 3000;

  app.useGlobalFilters(new WsExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.use(helmet());
  app.use(compression());

  await app.listen(PORT);
  logger.log(`server listening on port ${PORT}`);
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
