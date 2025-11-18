import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'admin123',
    minLength: 6,
  })
  password: string;
}
