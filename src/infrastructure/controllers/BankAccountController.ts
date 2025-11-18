import {
  Injectable,
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DepositHandler } from '../../application/commands/handlers/DepositHandler';
import { WithdrawHandler } from '../../application/commands/handlers/WithdrawHandler';
import { GetStatementHandler } from '../../application/queries/handlers/GetStatementHandler';
import { GetBalanceHandler } from '../../application/queries/handlers/GetBalanceHandler';
import { DepositCommand } from '../../application/commands/implements/DepositCommand';
import { WithdrawCommand } from '../../application/commands/implements/WithdrawCommand';
import { GetStatementQuery } from '../../application/queries/implements/GetStatementQuery';
import { GetBalanceQuery } from '../../application/queries/implements/GetBalanceQuery';
import { DepositDto } from '../../application/dto/DepositDto';
import { WithdrawDto } from '../../application/dto/WithdrawDto';
import { StatementLine } from '../../application/dto/StatementLine';
import { BalanceResponseDto } from '../../application/dto/BalanceResponseDto';
import { JwtAuthGuard } from '../auth/JwtAuthGuard';
import { User } from '../../domain/model/User';

@ApiTags('bank-account')
@ApiBearerAuth()
@Controller('bank-account')
@UseGuards(JwtAuthGuard)
@Injectable()
export class BankAccountController {
  constructor(
    private readonly depositHandler: DepositHandler,
    private readonly withdrawHandler: WithdrawHandler,
    private readonly getStatementHandler: GetStatementHandler,
    private readonly getBalanceHandler: GetBalanceHandler,
  ) {}

  @Post('deposit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deposit money',
    description: 'Deposit a specified amount into the bank account',
  })
  @ApiResponse({
    status: 200,
    description: 'Deposit successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Deposit successful' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid amount (must be positive)',
  })
  async deposit(
    @Body() depositDto: DepositDto,
    @Request() req: { user: User },
  ): Promise<{ message: string }> {
    const bankAccountId = req.user.getBankAccountId();
    const command = new DepositCommand(bankAccountId, depositDto.amount);
    await this.depositHandler.execute(command);
    return { message: 'Deposit successful' };
  }

  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Withdraw money',
    description: 'Withdraw a specified amount from the bank account',
  })
  @ApiResponse({
    status: 200,
    description: 'Withdrawal successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Withdrawal successful' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid amount (must be positive) or insufficient funds',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        error: { type: 'string', example: 'InsufficientFundsError' },
        message: {
          type: 'string',
          example: 'Insufficient funds.',
        },
        balance: { type: 'number', example: 100 },
        requested: { type: 'number', example: 200 },
      },
    },
  })
  async withdraw(
    @Body() withdrawDto: WithdrawDto,
    @Request() req: { user: User },
  ): Promise<{ message: string }> {
    const bankAccountId = req.user.getBankAccountId();
    const command = new WithdrawCommand(bankAccountId, withdrawDto.amount);
    await this.withdrawHandler.execute(command);
    return { message: 'Withdrawal successful' };
  }

  @Get('statement')
  @ApiOperation({
    summary: 'Get account statement',
    description: 'Retrieve the account statement with all transactions',
  })
  @ApiResponse({
    status: 200,
    description: 'Statement retrieved successfully',
    type: [StatementLine],
  })
  async getStatement(@Request() req: { user: User }): Promise<StatementLine[]> {
    const bankAccountId = req.user.getBankAccountId();
    const query = new GetStatementQuery(bankAccountId);
    return await this.getStatementHandler.execute(query);
  }

  @Get('balance')
  @ApiOperation({
    summary: 'Get account balance',
    description: 'Retrieve the current account balance',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance retrieved successfully',
    type: BalanceResponseDto,
  })
  async getBalance(
    @Request() req: { user: User },
  ): Promise<BalanceResponseDto> {
    const bankAccountId = req.user.getBankAccountId();
    const query = new GetBalanceQuery(bankAccountId);
    const balance = await this.getBalanceHandler.execute(query);
    return { balance };
  }
}
