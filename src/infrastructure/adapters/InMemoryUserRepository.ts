import { UserRepository } from '../../domain/ports/UserRepository';
import { User } from '../../domain/entities/User';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();

  async findByEmail(email: string): Promise<User | null> {
    return this.usersByEmail.get(email) || null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async save(user: User): Promise<void> {
    const existingUser = this.users.get(user.getId());
    if (existingUser) {
      // Remove old email mapping if email changed
      this.usersByEmail.delete(existingUser.getEmail());
    }
    this.users.set(user.getId(), user);
    this.usersByEmail.set(user.getEmail(), user);
  }
}
