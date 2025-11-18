import { Injectable } from '@nestjs/common';
import { BankAccountRepository } from '../../domain/ports/BankAccountRepository';
import { BankAccount } from '../../domain/entities/BankAccount';
import { Transaction } from '../../domain/entities/Transaction';
import { TransactionType } from '../../domain/entities/TransactionType';
import { PrismaService } from '../config/PrismaService';

@Injectable()
export class PrismaBankAccountRepository implements BankAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<BankAccount | null> {
    const entity = await this.prisma.bankAccount.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!entity) {
      return null;
    }

    return this.toDomain(entity);
  }

  async save(account: BankAccount): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Check if account exists
      const existingAccount = await tx.bankAccount.findUnique({
        where: { id: account.getId() },
      });

      if (!existingAccount) {
        // Create new account
        await tx.bankAccount.create({
          data: {
            id: account.getId(),
          },
        });
      }

      // Delete all existing transactions for this account
      await tx.transaction.deleteMany({
        where: { bankAccountId: account.getId() },
      });

      // Save all transactions from domain model
      const domainTransactions = account.getTransactions();
      if (domainTransactions.length > 0) {
        await tx.transaction.createMany({
          data: domainTransactions.map((transaction) => ({
            bankAccountId: account.getId(),
            type: transaction.type,
            amount: transaction.amount,
            date: transaction.date,
          })),
        });
      }
    });
  }

  private toDomain(entity: {
    id: string;
    transactions: Array<{
      id: string;
      type: string;
      amount: number;
      date: Date;
    }>;
  }): BankAccount {
    const account = new BankAccount(entity.id);
    const transactions = (entity.transactions || []).map((t) =>
      this.transactionToDomain(t),
    );

    transactions.forEach((transaction) => {
      if (transaction.type === TransactionType.DEPOSIT) {
        // Use deprecated method to preserve original transaction dates from DB
        account.depositWithDate(transaction.amount, transaction.date);
      } else {
        // Use deprecated method to preserve original transaction dates from DB
        account.withdrawWithDate(transaction.amount, transaction.date);
      }
    });

    return account;
  }

  private transactionToDomain(entity: {
    type: string;
    amount: number;
    date: Date;
  }): Transaction {
    return new Transaction(
      entity.type as TransactionType,
      entity.amount,
      entity.date,
    );
  }
}
