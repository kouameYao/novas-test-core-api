import { ApiProperty } from '@nestjs/swagger';

class UserDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({ description: 'User email', example: 'admin@example.com' })
  email: string;

  @ApiProperty({ description: 'User role', example: 'admin' })
  role: string;

  @ApiProperty({ description: 'Bank account ID', example: 'default-account' })
  bankAccountId: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({ description: 'User information', type: UserDto })
  user: UserDto;
}
