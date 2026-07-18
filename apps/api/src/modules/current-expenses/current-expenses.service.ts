import { Injectable } from '@nestjs/common';
import { CurrentExpense, Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateCurrentExpenseDto, UpdateCurrentExpenseDto } from './dto';

export type CurrentExpenseWithRelations = Prisma.CurrentExpenseGetPayload<{
  include: { expenseType: true; category: true };
}>;

@Injectable()
export class CurrentExpensesService {
  public constructor(private readonly prisma: PrismaService) {}

  public create(dto: CreateCurrentExpenseDto): Promise<CurrentExpense> {
    return this.prisma.currentExpense.create({ data: dto });
  }

  public findAll(periodId?: string): Promise<CurrentExpenseWithRelations[]> {
    return this.prisma.currentExpense.findMany({
      where: periodId ? { periodId } : undefined,
      include: { expenseType: true, category: true },
      orderBy: { paidAt: 'desc' },
    });
  }

  public findOne(id: string): Promise<CurrentExpenseWithRelations | null> {
    return this.prisma.currentExpense.findUnique({
      where: { id },
      include: { expenseType: true, category: true },
    });
  }

  public update(id: string, dto: UpdateCurrentExpenseDto): Promise<CurrentExpense> {
    return this.prisma.currentExpense.update({ where: { id }, data: dto });
  }

  public remove(id: string): Promise<CurrentExpense> {
    return this.prisma.currentExpense.delete({ where: { id } });
  }
}
