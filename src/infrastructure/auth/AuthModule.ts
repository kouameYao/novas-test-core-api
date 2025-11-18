import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '../../interface/controllers/AuthController';
import { AuthService } from './AuthService';
import { JwtStrategy } from './JwtStrategy';
import { JwtAuthGuard } from './JwtAuthGuard';
import { UserService } from './UserService';
import { SeedService } from './SeedService';
import { PrismaUserRepository } from '../adapters/PrismaUserRepository';
import { BankAccountModule } from '../index';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any,
      },
    }),
    BankAccountModule,
  ],
  providers: [
    {
      provide: 'UserRepository',
      useClass: PrismaUserRepository,
    },
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    UserService,
    SeedService,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, UserService, SeedService],
})
export class AuthModule {}
