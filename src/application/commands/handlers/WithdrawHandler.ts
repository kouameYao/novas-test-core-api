import { Injectable, Inject } from '@nestjs/common';
import { WithdrawCommand } from '../implements/WithdrawCommand';
import { BankAccountRepository } from '../../../ports/BankAccountRepository';
import { Clock } from '../../../domain/services/Clock';

@Injectable()
export class WithdrawHandler {
  constructor(
    @Inject('BankAccountRepository')
    private readonly repository: BankAccountRepository,
    @Inject('Clock')
    private readonly clock: Clock,
  ) {}

  async execute(command: WithdrawCommand): Promise<void> {
    const account = await this.repository.findById(command.accountId);

    if (!account) {
      throw new Error(`Account ${command.accountId} not found`);
    }

    // Use the new interface-compliant method
    account.withdraw(command.amount);
    await this.repository.save(account);
  }
}
