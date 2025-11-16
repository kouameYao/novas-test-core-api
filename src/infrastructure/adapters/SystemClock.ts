import { Injectable } from '@nestjs/common';
import { Clock } from '../../domain/services/Clock';

@Injectable()
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
