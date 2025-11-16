import { ApiProperty } from '@nestjs/swagger';

export class StatementLine {
  @ApiProperty({
    description: 'Transaction date',
    example: '2024-01-15T10:30:00.000Z',
  })
  date: Date;

  @ApiProperty({
    description:
      'Transaction amount (positive for deposit, negative for withdrawal)',
    example: 100.5,
  })
  amount: number;

  @ApiProperty({
    description: 'Running balance after this transaction',
    example: 500.75,
  })
  balance: number;

  constructor(date: Date, amount: number, balance: number) {
    this.date = date;
    this.amount = amount;
    this.balance = balance;
  }
}
