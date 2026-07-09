import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PeriodsService } from './periods.service';
import { CreatePeriodDto } from './dto';

@ApiTags('Periods')
@Controller('periods')
export class PeriodsController {
  constructor(private readonly service: PeriodsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a monthly period' })
  create(@Body() dto: CreatePeriodDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all periods' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a period with incomes and expenses' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a period' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
