import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({
    description: 'Amount to deposit',
    example: 100,
    minimum: 0.01,
  })
  amount: number;
}
