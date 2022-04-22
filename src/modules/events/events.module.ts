import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsGateway } from './events.gateway';
import { LoggerService } from '../logger/logger.service';

@Module({
  providers: [EventsService, EventsGateway, LoggerService],
})
export class EventsModule {}
