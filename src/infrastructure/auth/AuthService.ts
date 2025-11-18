import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/ports/UserRepository';
import { User } from '../../domain/entities/User';
import { LoginDto } from '../../interface/dto/LoginDto';
import { AuthResponseDto } from '../../interface/dto/AuthResponseDto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.getPasswordHash(),
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.getId(),
      email: user.getEmail(),
      role: user.getRole(),
      bankAccountId: user.getBankAccountId(),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.getId(),
        email: user.getEmail(),
        role: user.getRole(),
        bankAccountId: user.getBankAccountId(),
      },
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }
}
