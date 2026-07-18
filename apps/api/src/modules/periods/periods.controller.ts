import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Period } from '@prisma/client';

import { CreatePeriodDto } from './dto';
import { PeriodsService, PeriodWithRelations } from './periods.service';

@ApiTags('Periods')
@Controller('periods')
export class PeriodsController {
  public constructor(private readonly service: PeriodsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a monthly period' })
  public create(@Body() dto: CreatePeriodDto): Promise<Period> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all periods' })
  public findAll(): Promise<Period[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a period with incomes and expenses' })
  public findOne(@Param('id') id: string): Promise<PeriodWithRelations | null> {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a period' })
  public remove(@Param('id') id: string): Promise<Period> {
    return this.service.remove(id);
  }
}
