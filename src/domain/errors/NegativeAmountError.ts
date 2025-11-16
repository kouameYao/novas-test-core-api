export class NegativeAmountError extends Error {
  constructor(amount: number) {
    super(`Amount must be positive, got: ${amount}`);
    this.name = 'NegativeAmountError';
  }
}
