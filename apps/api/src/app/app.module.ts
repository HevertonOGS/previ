import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CurrentExpensesModule } from '../modules/current-expenses/current-expenses.module';
import { GeneralExpensesModule } from '../modules/general-expenses/general-expenses.module';
import { GoalsModule } from '../modules/goals/goals.module';
import { ImportModule } from '../modules/import/import.module';
import { IncomesModule } from '../modules/incomes/incomes.module';
import { PeriodsModule } from '../modules/periods/periods.module';
import { ReferenceModule } from '../modules/reference/reference.module';
import { WeeklyBalancesModule } from '../modules/weekly-balances/weekly-balances.module';
import { PrismaModule } from '../prisma/prisma.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ReferenceModule,
    PeriodsModule,
    IncomesModule,
    GeneralExpensesModule,
    CurrentExpensesModule,
    GoalsModule,
    WeeklyBalancesModule,
    ImportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
