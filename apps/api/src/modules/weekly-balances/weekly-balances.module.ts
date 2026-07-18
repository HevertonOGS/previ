import { Module } from '@nestjs/common';

import { WeeklyBalancesController } from './weekly-balances.controller';
import { WeeklyBalancesService } from './weekly-balances.service';

@Module({
  controllers: [WeeklyBalancesController],
  providers: [WeeklyBalancesService],
  exports: [WeeklyBalancesService],
})
export class WeeklyBalancesModule {}
