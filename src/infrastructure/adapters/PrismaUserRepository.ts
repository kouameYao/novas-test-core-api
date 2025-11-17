import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/ports/UserRepository';
import { User } from '../../domain/model/User';
import { PrismaService } from '../config/PrismaService';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.prisma.user.findUnique({
      where: { email },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.prisma.user.findUnique({
      where: { id },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.getId() },
      update: {
        email: user.getEmail(),
        passwordHash: user.getPasswordHash(),
        role: user.getRole(),
        bankAccountId: user.getBankAccountId(),
      },
      create: {
        id: user.getId(),
        email: user.getEmail(),
        passwordHash: user.getPasswordHash(),
        role: user.getRole(),
        bankAccountId: user.getBankAccountId(),
      },
    });
  }

  private toDomain(entity: {
    id: string;
    email: string;
    passwordHash: string;
    role: string;
    bankAccountId: string;
  }): User {
    return new User(
      entity.id,
      entity.email,
      entity.passwordHash,
      entity.role as 'admin' | 'user',
      entity.bankAccountId,
    );
  }
}
