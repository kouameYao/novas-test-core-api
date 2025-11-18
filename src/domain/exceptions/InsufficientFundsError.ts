export class InsufficientFundsError extends Error {
  public readonly balance: number;
  public readonly requested: number;

  constructor(balance: number, requested: number) {
    super(`Insufficient funds.`);
    this.name = 'InsufficientFundsError';
    this.balance = balance;
    this.requested = requested;
  }
}
