export class InsufficientFundsError extends Error {
  constructor(balance: number, requested: number) {
    super(`Insufficient funds. Balance: ${balance}, Requested: ${requested}`);
    this.name = 'InsufficientFundsError';
  }
}
