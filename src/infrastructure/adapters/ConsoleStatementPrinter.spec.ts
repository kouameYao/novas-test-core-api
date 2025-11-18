import { ConsoleStatementPrinter } from './ConsoleStatementPrinter';
import { StatementLine } from '../../interface/dto/StatementLine';

describe('ConsoleStatementPrinter', () => {
  let printer: ConsoleStatementPrinter;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    printer = new ConsoleStatementPrinter();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should print empty message when no lines', () => {
    printer.print([]);

    expect(consoleSpy).toHaveBeenCalledWith('No transactions');
  });

  it('should print statement with header and lines', () => {
    const lines = [
      new StatementLine(new Date('2024-01-03'), -30, 120),
      new StatementLine(new Date('2024-01-02'), 50, 150),
      new StatementLine(new Date('2024-01-01'), 100, 100),
    ];

    printer.print(lines);

    expect(consoleSpy).toHaveBeenCalledWith('Date       | Amount | Balance');
    expect(consoleSpy).toHaveBeenCalledWith('--------------------------------');
    expect(consoleSpy).toHaveBeenCalledTimes(5); // header + separator + 3 lines
  });

  it('should format positive amounts with + sign', () => {
    const lines = [new StatementLine(new Date('2024-01-01'), 100, 100)];
    printer.print(lines);

    const logCalls = consoleSpy.mock.calls;
    const lineCall = logCalls.find((call) => call[0].includes('2024-01-01'));
    expect(lineCall[0]).toContain('+100');
  });

  it('should format negative amounts without + sign', () => {
    const lines = [new StatementLine(new Date('2024-01-01'), -30, 70)];
    printer.print(lines);

    const logCalls = consoleSpy.mock.calls;
    const lineCall = logCalls.find((call) => call[0].includes('2024-01-01'));
    expect(lineCall[0]).toContain('-30');
    expect(lineCall[0]).not.toContain('+-30');
  });
});
