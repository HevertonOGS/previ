import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GeneralExpense } from '@prisma/client';

import { CreateGeneralExpenseDto, UpdateGeneralExpenseDto } from './dto';
import {
  GeneralExpensesService,
  GeneralExpenseWithRelations,
} from './general-expenses.service';

@ApiTags('General Expenses')
@Controller('general-expenses')
export class GeneralExpensesController {
  public constructor(private readonly service: GeneralExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a general expense' })
  public create(@Body() dto: CreateGeneralExpenseDto): Promise<GeneralExpense> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List general expenses, optionally filtered by period' })
  @ApiQuery({ name: 'periodId', required: false })
  public findAll(@Query('periodId') periodId?: string): Promise<GeneralExpenseWithRelations[]> {
    return this.service.findAll(periodId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a general expense by id' })
  public findOne(@Param('id') id: string): Promise<GeneralExpenseWithRelations | null> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a general expense' })
  public update(
    @Param('id') id: string,
    @Body() dto: UpdateGeneralExpenseDto,
  ): Promise<GeneralExpense> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a general expense' })
  public remove(@Param('id') id: string): Promise<GeneralExpense> {
    return this.service.remove(id);
  }
}
