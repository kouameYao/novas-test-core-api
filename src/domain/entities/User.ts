export class User {
  constructor(
    private readonly id: string,
    private readonly email: string,
    private readonly passwordHash: string,
    private readonly role: 'admin' | 'user',
    private readonly bankAccountId: string,
  ) {}

  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getRole(): 'admin' | 'user' {
    return this.role;
  }

  getBankAccountId(): string {
    return this.bankAccountId;
  }
}
