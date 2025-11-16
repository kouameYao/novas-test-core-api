import { Clock } from '../../domain/services/Clock';

export class FakeClock implements Clock {
  private currentDate: Date;

  constructor(initialDate?: Date) {
    this.currentDate = initialDate || new Date('2024-01-01');
  }

  now(): Date {
    return new Date(this.currentDate);
  }

  setDate(date: Date): void {
    this.currentDate = date;
  }

  advanceDays(days: number): void {
    this.currentDate = new Date(
      this.currentDate.getTime() + days * 24 * 60 * 60 * 1000,
    );
  }
}
