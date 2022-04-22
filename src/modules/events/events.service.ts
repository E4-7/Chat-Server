import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class EventsService {
  private readonly logger = new LoggerService(EventsService.name);
}
