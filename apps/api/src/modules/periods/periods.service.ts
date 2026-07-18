import { Injectable } from '@nestjs/common';
import { Period, Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreatePeriodDto } from './dto';

export type PeriodWithRelations = Prisma.PeriodGetPayload<{
  include: {
    incomes: true;
    generalExpenses: { include: { expenseType: true; category: true } };
    currentExpenses: { include: { expenseType: true; category: true } };
  };
}>;

@Injectable()
export class PeriodsService {
  public constructor(private readonly prisma: PrismaService) {}

  public create(dto: CreatePeriodDto): Promise<Period> {
    return this.prisma.period.create({ data: dto });
  }

  public findAll(): Promise<Period[]> {
    return this.prisma.period.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  public findOne(id: string): Promise<PeriodWithRelations | null> {
    return this.prisma.period.findUnique({
      where: { id },
      include: {
        incomes: true,
        generalExpenses: { include: { expenseType: true, category: true } },
        currentExpenses: { include: { expenseType: true, category: true } },
      },
    });
  }

  public remove(id: string): Promise<Period> {
    return this.prisma.period.delete({ where: { id } });
  }
}
