import { Injectable } from '@nestjs/common';
import { Goal, GoalEntry, Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateGoalDto, UpdateGoalDto, CreateGoalEntryDto, UpdateGoalEntryDto } from './dto';

export type GoalWithEntries = Prisma.GoalGetPayload<{
  include: { entries: true };
}>;

@Injectable()
export class GoalsService {
  public constructor(private readonly prisma: PrismaService) {}

  public create(dto: CreateGoalDto): Promise<Goal> {
    const { targetDate, ...rest } = dto;
    return this.prisma.goal.create({
      data: {
        ...rest,
        ...(targetDate ? { targetDate: new Date(targetDate) } : {}),
      },
    });
  }

  public findAll(): Promise<GoalWithEntries[]> {
    return this.prisma.goal.findMany({
      orderBy: { createdAt: 'desc' },
      include: { entries: { orderBy: [{ year: 'desc' }, { month: 'desc' }] } },
    });
  }

  public findOne(id: string): Promise<GoalWithEntries | null> {
    return this.prisma.goal.findUnique({
      where: { id },
      include: { entries: { orderBy: [{ year: 'desc' }, { month: 'desc' }] } },
    });
  }

  public update(id: string, dto: UpdateGoalDto): Promise<Goal> {
    return this.prisma.goal.update({
      where: { id },
      data: {
        ...dto,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      },
    });
  }

  public remove(id: string): Promise<Goal> {
    return this.prisma.goal.delete({ where: { id } });
  }

  public createEntry(dto: CreateGoalEntryDto): Promise<GoalEntry> {
    return this.prisma.goalEntry.create({ data: dto });
  }

  public findEntries(goalId: string): Promise<GoalEntry[]> {
    return this.prisma.goalEntry.findMany({
      where: { goalId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  public updateEntry(id: string, dto: UpdateGoalEntryDto): Promise<GoalEntry> {
    return this.prisma.goalEntry.update({ where: { id }, data: dto });
  }

  public removeEntry(id: string): Promise<GoalEntry> {
    return this.prisma.goalEntry.delete({ where: { id } });
  }
}
