import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IncomesService } from './incomes.service';
import { CreateIncomeDto, UpdateIncomeDto } from './dto';

@ApiTags('Incomes')
@Controller('incomes')
export class IncomesController {
  constructor(private readonly service: IncomesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an income entry' })
  create(@Body() dto: CreateIncomeDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List incomes, optionally filtered by period' })
  @ApiQuery({ name: 'periodId', required: false })
  findAll(@Query('periodId') periodId?: string) {
    return this.service.findAll(periodId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an income by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an income' })
  update(@Param('id') id: string, @Body() dto: UpdateIncomeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an income' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
