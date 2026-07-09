import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGoalDto, UpdateGoalDto, CreateGoalEntryDto, UpdateGoalEntryDto } from './dto';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateGoalDto) {
    return this.prisma.goal.create({ data: dto });
  }

  findAll() {
    return this.prisma.goal.findMany({
      orderBy: { createdAt: 'desc' },
      include: { entries: { orderBy: [{ year: 'desc' }, { month: 'desc' }] } },
    });
  }

  findOne(id: string) {
    return this.prisma.goal.findUnique({
      where: { id },
      include: { entries: { orderBy: [{ year: 'desc' }, { month: 'desc' }] } },
    });
  }

  update(id: string, dto: UpdateGoalDto) {
    return this.prisma.goal.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.goal.delete({ where: { id } });
  }

  createEntry(dto: CreateGoalEntryDto) {
    return this.prisma.goalEntry.create({ data: dto });
  }

  findEntries(goalId: string) {
    return this.prisma.goalEntry.findMany({
      where: { goalId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  updateEntry(id: string, dto: UpdateGoalEntryDto) {
    return this.prisma.goalEntry.update({ where: { id }, data: dto });
  }

  removeEntry(id: string) {
    return this.prisma.goalEntry.delete({ where: { id } });
  }
}
