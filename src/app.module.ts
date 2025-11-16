import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BankAccountModule } from './infrastructure/index';
import { AuthModule } from './infrastructure/auth/AuthModule';
import { PrismaModule } from './infrastructure/config/PrismaModule';
import { getDatabaseUrl } from './infrastructure/config/database.config';

// Set DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = getDatabaseUrl();
}

@Module({
  imports: [PrismaModule, AuthModule, BankAccountModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
