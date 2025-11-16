import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccountRepository } from '../../ports/BankAccountRepository';
import { BankAccount } from '../../domain/model/BankAccount';
import { Transaction } from '../../domain/model/Transaction';
import { TransactionType } from '../../domain/model/TransactionType';
import { BankAccountEntity } from '../entities/BankAccountEntity';
import { TransactionEntity } from '../entities/TransactionEntity';

@Injectable()
export class TypeOrmBankAccountRepository implements BankAccountRepository {
  constructor(
    @InjectRepository(BankAccountEntity)
    private readonly accountRepository: Repository<BankAccountEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async findById(id: string): Promise<BankAccount | null> {
    const entity = await this.accountRepository.findOne({
      where: { id },
      relations: ['transactions'],
    });

    if (!entity) {
      return null;
    }

    return this.toDomain(entity);
  }

  async save(account: BankAccount): Promise<void> {
    // Check if account exists
    let accountEntity = await this.accountRepository.findOne({
      where: { id: account.getId() },
    });

    if (!accountEntity) {
      // Create new account
      accountEntity = new BankAccountEntity();
      accountEntity.id = account.getId();
      await this.accountRepository.save(accountEntity);
    }

    // Delete all existing transactions for this account
    await this.transactionRepository.delete({
      bankAccountId: account.getId(),
    });

    // Save all transactions from domain model
    const domainTransactions = account.getTransactions();
    if (domainTransactions.length > 0) {
      const transactionEntities = domainTransactions.map((transaction) => {
        const entity = new TransactionEntity();
        entity.bankAccountId = account.getId();
        entity.type = transaction.type;
        entity.amount = transaction.amount;
        entity.date = transaction.date;
        return entity;
      });

      await this.transactionRepository.save(transactionEntities);
    }
  }

  private toDomain(entity: BankAccountEntity): BankAccount {
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

  private transactionToDomain(entity: TransactionEntity): Transaction {
    return new Transaction(
      entity.type,
      Number(entity.amount),
      entity.date,
    );
  }
}

