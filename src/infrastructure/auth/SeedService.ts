import { Injectable } from '@nestjs/common';
import { UserService } from './UserService';

@Injectable()
export class SeedService {
  constructor(private readonly userService: UserService) {}

  async seedAdmin(): Promise<void> {
    try {
      await this.userService.createUser(
        'admin@example.com',
        'admin123',
        'admin',
      );
      console.log('Admin user created successfully');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('Admin user already exists');
      } else {
        throw error;
      }
    }
  }
}
