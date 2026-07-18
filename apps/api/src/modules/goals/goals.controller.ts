import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Goal, GoalEntry } from '@prisma/client';

import { CreateGoalDto, UpdateGoalDto, CreateGoalEntryDto, UpdateGoalEntryDto } from './dto';
import { GoalsService, GoalWithEntries } from './goals.service';

@ApiTags('Goals')
@Controller('goals')
export class GoalsController {
  public constructor(private readonly service: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a savings goal' })
  public create(@Body() dto: CreateGoalDto): Promise<Goal> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all goals with entries' })
  public findAll(): Promise<GoalWithEntries[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a goal by id with entries' })
  public findOne(@Param('id') id: string): Promise<GoalWithEntries | null> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a goal' })
  public update(@Param('id') id: string, @Body() dto: UpdateGoalDto): Promise<Goal> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a goal' })
  public remove(@Param('id') id: string): Promise<Goal> {
    return this.service.remove(id);
  }

  @Post('entries')
  @ApiOperation({ summary: 'Create a goal entry (monthly planned/actual)' })
  public createEntry(@Body() dto: CreateGoalEntryDto): Promise<GoalEntry> {
    return this.service.createEntry(dto);
  }

  @Get(':goalId/entries')
  @ApiOperation({ summary: 'List entries for a goal' })
  public findEntries(@Param('goalId') goalId: string): Promise<GoalEntry[]> {
    return this.service.findEntries(goalId);
  }

  @Patch('entries/:id')
  @ApiOperation({ summary: 'Update a goal entry' })
  public updateEntry(
    @Param('id') id: string,
    @Body() dto: UpdateGoalEntryDto,
  ): Promise<GoalEntry> {
    return this.service.updateEntry(id, dto);
  }

  @Delete('entries/:id')
  @ApiOperation({ summary: 'Delete a goal entry' })
  public removeEntry(@Param('id') id: string): Promise<GoalEntry> {
    return this.service.removeEntry(id);
  }
}
