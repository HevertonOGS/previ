import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto, CreateGoalEntryDto, UpdateGoalEntryDto } from './dto';

@Injectable()
export class GoalsService {
  public constructor(private readonly prisma: PrismaService) {}

  public create(dto: CreateGoalDto) {
    const { targetDate, ...rest } = dto;
    return this.prisma.goal.create({
      data: {
        ...rest,
        ...(targetDate ? { targetDate: new Date(targetDate) } : {}),
      },
    });
  }

  public findAll() {
    return this.prisma.goal.findMany({
      orderBy: { createdAt: 'desc' },
      include: { entries: { orderBy: [{ year: 'desc' }, { month: 'desc' }] } },
    });
  }

  public findOne(id: string) {
    return this.prisma.goal.findUnique({
      where: { id },
      include: { entries: { orderBy: [{ year: 'desc' }, { month: 'desc' }] } },
    });
  }

  public update(id: string, dto: UpdateGoalDto) {
    return this.prisma.goal.update({
      where: { id },
      data: {
        ...dto,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      },
    });
  }

  public remove(id: string) {
    return this.prisma.goal.delete({ where: { id } });
  }

  public createEntry(dto: CreateGoalEntryDto) {
    return this.prisma.goalEntry.create({ data: dto });
  }

  public findEntries(goalId: string) {
    return this.prisma.goalEntry.findMany({
      where: { goalId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  public updateEntry(id: string, dto: UpdateGoalEntryDto) {
    return this.prisma.goalEntry.update({ where: { id }, data: dto });
  }

  public removeEntry(id: string) {
    return this.prisma.goalEntry.delete({ where: { id } });
  }
}
