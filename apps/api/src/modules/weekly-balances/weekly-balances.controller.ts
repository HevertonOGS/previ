import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { WeeklyBalance } from '@prisma/client';

import { CreateWeeklyBalanceDto, UpdateBudgetDto } from './dto';
import { WeeklyBalancesService, WeeklyBalanceWithItems } from './weekly-balances.service';

@ApiTags('Weekly Balances')
@Controller('weekly-balances')
export class WeeklyBalancesController {
  public constructor(private readonly service: WeeklyBalancesService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate and store weekly balance from expenses' })
  public calculate(@Body() dto: CreateWeeklyBalanceDto): Promise<WeeklyBalance> {
    return this.service.calculate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all weekly balances for a period' })
  @ApiQuery({ name: 'periodId', required: true })
  public findAllByPeriod(@Query('periodId') periodId: string): Promise<WeeklyBalanceWithItems[]> {
    return this.service.findAllByPeriod(periodId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a weekly balance with type and category breakdown' })
  public findOne(@Param('id') id: string): Promise<WeeklyBalanceWithItems | null> {
    return this.service.findOne(id);
  }

  @Patch(':id/budget')
  @ApiOperation({ summary: 'Update the weekly budget' })
  public setBudget(@Param('id') id: string, @Body() dto: UpdateBudgetDto): Promise<WeeklyBalance> {
    return this.service.setBudget(id, dto.budget);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a weekly balance' })
  public delete(@Param('id') id: string): Promise<WeeklyBalance> {
    return this.service.delete(id);
  }
}
