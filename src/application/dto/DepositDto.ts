import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({
    description: 'Amount to deposit',
    example: 100,
    minimum: 100,
  })
  amount: number;
}
