import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ReferenceModule } from '../modules/reference/reference.module';
import { PeriodsModule } from '../modules/periods/periods.module';
import { IncomesModule } from '../modules/incomes/incomes.module';
import { GeneralExpensesModule } from '../modules/general-expenses/general-expenses.module';
import { CurrentExpensesModule } from '../modules/current-expenses/current-expenses.module';
import { GoalsModule } from '../modules/goals/goals.module';
import { WeeklyBalancesModule } from '../modules/weekly-balances/weekly-balances.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
