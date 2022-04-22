import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './modules/events/events.module';
import { ConfigModule } from '@nestjs/config';
import appConfig from './common/config/app.config';
import databaseConfig from './common/config/database.config';
import { validationSchema } from './common/config/env.validation.config';

@Module({
  imports: [
    EventsModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [appConfig, databaseConfig],
      isGlobal: true,
      validationSchema,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
