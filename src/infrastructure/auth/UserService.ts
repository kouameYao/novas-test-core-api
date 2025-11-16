import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/ports/UserRepository';
import { BankAccountRepository } from '../../domain/ports/BankAccountRepository';
import { User } from '../../domain/model/User';
import { BankAccount } from '../../domain/model/BankAccount';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('BankAccountRepository')
    private readonly bankAccountRepository: BankAccountRepository,
  ) {}

  async createUser(
    email: string,
    password: string,
    role: 'admin' | 'user' = 'user',
  ): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create bank account for the user
    const bankAccountId = uuidv4();
    const bankAccount = new BankAccount(bankAccountId);
    await this.bankAccountRepository.save(bankAccount);

    // Create user
    const userId = uuidv4();
    const user = new User(userId, email, passwordHash, role, bankAccountId);
    await this.userRepository.save(user);

    return user;
  }
}
