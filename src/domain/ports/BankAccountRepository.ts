import { BankAccount } from '../entities/BankAccount';

export interface BankAccountRepository {
  findById(id: string): Promise<BankAccount | null>;
  save(account: BankAccount): Promise<void>;
}
