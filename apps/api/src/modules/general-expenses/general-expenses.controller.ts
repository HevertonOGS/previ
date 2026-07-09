import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GeneralExpensesService } from './general-expenses.service';
import { CreateGeneralExpenseDto, UpdateGeneralExpenseDto } from './dto';

@ApiTags('General Expenses')
@Controller('general-expenses')
export class GeneralExpensesController {
  constructor(private readonly service: GeneralExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a general expense' })
  create(@Body() dto: CreateGeneralExpenseDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List general expenses, optionally filtered by period' })
  @ApiQuery({ name: 'periodId', required: false })
  findAll(@Query('periodId') periodId?: string) {
    return this.service.findAll(periodId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a general expense by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a general expense' })
  update(@Param('id') id: string, @Body() dto: UpdateGeneralExpenseDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a general expense' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
