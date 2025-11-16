import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from './AuthService';
import { JwtStrategy } from './JwtStrategy';
import { JwtAuthGuard } from './JwtAuthGuard';
import { UserService } from './UserService';
import { SeedService } from './SeedService';
import { TypeOrmUserRepository } from '../adapters/TypeOrmUserRepository';
import { UserEntity } from '../entities/UserEntity';
import { BankAccountModule } from '../index';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
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
      useClass: TypeOrmUserRepository,
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
