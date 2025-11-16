import { BankAccount } from '../model/BankAccount';

export interface BankAccountRepository {
  findById(id: string): Promise<BankAccount | null>;
  save(account: BankAccount): Promise<void>;
}
