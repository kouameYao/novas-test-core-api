import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponseDto {
  @ApiProperty({
    description: 'Current account balance',
    example: 500,
  })
  balance: number;
}
