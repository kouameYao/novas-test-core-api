import { Injectable, Inject } from '@nestjs/common';
import { DepositCommand } from '../implements/DepositCommand';
import { BankAccountRepository } from '../../../domain/ports/BankAccountRepository';
import { Clock } from '../../../domain/services/Clock';
import { BankAccount } from '../../../domain/entities/BankAccount';

@Injectable()
export class DepositHandler {
  constructor(
    @Inject('BankAccountRepository')
    private readonly repository: BankAccountRepository,
    @Inject('Clock')
    private readonly clock: Clock,
  ) {}

  async execute(command: DepositCommand): Promise<void> {
    let account = await this.repository.findById(command.accountId);

    if (!account) {
      account = new BankAccount(command.accountId, this.clock);
    }

    account.deposit(command.amount);
    await this.repository.save(account);
  }
}
