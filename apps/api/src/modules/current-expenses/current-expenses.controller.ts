import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentExpense } from '@prisma/client';

import { CurrentExpensesService, CurrentExpenseWithRelations } from './current-expenses.service';
import { CreateCurrentExpenseDto, UpdateCurrentExpenseDto } from './dto';

@ApiTags('Current Expenses')
@Controller('current-expenses')
export class CurrentExpensesController {
  public constructor(private readonly service: CurrentExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a current expense' })
  public create(@Body() dto: CreateCurrentExpenseDto): Promise<CurrentExpense> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List current expenses, optionally filtered by period' })
  @ApiQuery({ name: 'periodId', required: false })
  public findAll(@Query('periodId') periodId?: string): Promise<CurrentExpenseWithRelations[]> {
    return this.service.findAll(periodId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a current expense by id' })
  public findOne(@Param('id') id: string): Promise<CurrentExpenseWithRelations | null> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a current expense' })
  public update(
    @Param('id') id: string,
    @Body() dto: UpdateCurrentExpenseDto,
  ): Promise<CurrentExpense> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a current expense' })
  public remove(@Param('id') id: string): Promise<CurrentExpense> {
    return this.service.remove(id);
  }
}
