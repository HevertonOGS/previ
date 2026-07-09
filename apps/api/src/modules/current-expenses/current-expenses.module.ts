import { Module } from '@nestjs/common';
import { CurrentExpensesController } from './current-expenses.controller';
import { CurrentExpensesService } from './current-expenses.service';

@Module({
  controllers: [CurrentExpensesController],
  providers: [CurrentExpensesService],
  exports: [CurrentExpensesService],
})
export class CurrentExpensesModule {}
