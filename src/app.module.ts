import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BankAccountModule } from './infrastructure/index';
import { AuthModule } from './infrastructure/auth/AuthModule';
import { getDatabaseConfig } from './infrastructure/config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    AuthModule,
    BankAccountModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
