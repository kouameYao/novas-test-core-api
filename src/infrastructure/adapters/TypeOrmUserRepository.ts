import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../../ports/UserRepository';
import { User } from '../../domain/model/User';
import { UserEntity } from '../entities/UserEntity';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(user: User): Promise<void> {
    const entity = this.toEntity(user);
    await this.repository.save(entity);
  }

  private toDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.email,
      entity.passwordHash,
      entity.role,
      entity.bankAccountId,
    );
  }

  private toEntity(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.getId();
    entity.email = user.getEmail();
    entity.passwordHash = user.getPasswordHash();
    entity.role = user.getRole();
    entity.bankAccountId = user.getBankAccountId();
    return entity;
  }
}

