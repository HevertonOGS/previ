import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto, CreateGoalEntryDto, UpdateGoalEntryDto } from './dto';

@ApiTags('Goals')
@Controller('goals')
export class GoalsController {
  constructor(private readonly service: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a savings goal' })
  create(@Body() dto: CreateGoalDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all goals with entries' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a goal by id with entries' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal' })
  update(@Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goal' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('entries')
  @ApiOperation({ summary: 'Create a goal entry (monthly planned/actual)' })
  createEntry(@Body() dto: CreateGoalEntryDto) {
    return this.service.createEntry(dto);
  }

  @Get(':goalId/entries')
  @ApiOperation({ summary: 'List entries for a goal' })
  findEntries(@Param('goalId') goalId: string) {
    return this.service.findEntries(goalId);
  }

  @Patch('entries/:id')
  @ApiOperation({ summary: 'Update a goal entry' })
  updateEntry(@Param('id') id: string, @Body() dto: UpdateGoalEntryDto) {
    return this.service.updateEntry(id, dto);
  }

  @Delete('entries/:id')
  @ApiOperation({ summary: 'Delete a goal entry' })
  removeEntry(@Param('id') id: string) {
    return this.service.removeEntry(id);
  }
}
