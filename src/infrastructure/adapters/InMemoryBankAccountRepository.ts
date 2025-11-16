import { Injectable } from '@nestjs/common';
import { BankAccountRepository } from '../../ports/BankAccountRepository';
import { BankAccount } from '../../domain/model/BankAccount';
import { TransactionType } from '../../domain/model/TransactionType';

@Injectable()
export class InMemoryBankAccountRepository implements BankAccountRepository {
  private accounts: Map<string, BankAccount> = new Map();

  async findById(id: string): Promise<BankAccount | null> {
    const account = this.accounts.get(id);
    return account ? this.cloneAccount(account) : null;
  }

  async save(account: BankAccount): Promise<void> {
    this.accounts.set(account.getId(), this.cloneAccount(account));
  }

  private cloneAccount(account: BankAccount): BankAccount {
    const cloned = new BankAccount(account.getId());
    const transactions = account.getTransactions();
    transactions.forEach((transaction) => {
      if (transaction.type === TransactionType.DEPOSIT) {
        // Use deprecated method to preserve original transaction dates
        cloned.depositWithDate(transaction.amount, transaction.date);
      } else {
        // Use deprecated method to preserve original transaction dates
        cloned.withdrawWithDate(transaction.amount, transaction.date);
      }
    });
    return cloned;
  }
}
