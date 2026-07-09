import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentExpensesService } from './current-expenses.service';
import { CreateCurrentExpenseDto, UpdateCurrentExpenseDto } from './dto';

@ApiTags('Current Expenses')
@Controller('current-expenses')
export class CurrentExpensesController {
  constructor(private readonly service: CurrentExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a current expense' })
  create(@Body() dto: CreateCurrentExpenseDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List current expenses, optionally filtered by period' })
  @ApiQuery({ name: 'periodId', required: false })
  findAll(@Query('periodId') periodId?: string) {
    return this.service.findAll(periodId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a current expense by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a current expense' })
  update(@Param('id') id: string, @Body() dto: UpdateCurrentExpenseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a current expense' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
