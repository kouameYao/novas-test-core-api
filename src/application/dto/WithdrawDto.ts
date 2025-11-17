import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty({
    description: 'Amount to withdraw',
    example: 50,
    minimum: 100,
  })
  amount: number;
}
