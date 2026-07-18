import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Income } from '@prisma/client';

import { CreateIncomeDto, UpdateIncomeDto } from './dto';
import { IncomesService } from './incomes.service';

@ApiTags('Incomes')
@Controller('incomes')
export class IncomesController {
  public constructor(private readonly service: IncomesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an income entry' })
  public create(@Body() dto: CreateIncomeDto): Promise<Income> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List incomes, optionally filtered by period' })
  @ApiQuery({ name: 'periodId', required: false })
  public findAll(@Query('periodId') periodId?: string): Promise<Income[]> {
    return this.service.findAll(periodId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an income by id' })
  public findOne(@Param('id') id: string): Promise<Income | null> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an income' })
  public update(@Param('id') id: string, @Body() dto: UpdateIncomeDto): Promise<Income> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an income' })
  public remove(@Param('id') id: string): Promise<Income> {
    return this.service.remove(id);
  }
}
