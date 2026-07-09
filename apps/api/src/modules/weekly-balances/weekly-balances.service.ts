import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWeeklyBalanceDto } from './dto';

@Injectable()
export class WeeklyBalancesService {
  constructor(private readonly prisma: PrismaService) {}

  public async calculate(dto: CreateWeeklyBalanceDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    const [generalExpenses, currentExpenses] = await Promise.all([
      this.prisma.generalExpense.findMany({
        where: {
          periodId: dto.periodId,
          paidAt: { gte: start, lte: end },
          status: 'PAID',
        },
        select: { actualAmount: true, expenseTypeId: true, categoryId: true },
      }),
      this.prisma.currentExpense.findMany({
        where: {
          periodId: dto.periodId,
          paidAt: { gte: start, lte: end },
        },
        select: { amount: true, expenseTypeId: true, categoryId: true },
      }),
    ]);

    const byType = new Map<string, number>();
    const byCategory = new Map<string, number>();
    let totalSpent = 0;

    for (const e of generalExpenses) {
      const amount = Number(e.actualAmount ?? 0);
      totalSpent += amount;
      byType.set(e.expenseTypeId, (byType.get(e.expenseTypeId) ?? 0) + amount);
      byCategory.set(e.categoryId, (byCategory.get(e.categoryId) ?? 0) + amount);
    }

    for (const e of currentExpenses) {
      const amount = Number(e.amount);
      totalSpent += amount;
      byType.set(e.expenseTypeId, (byType.get(e.expenseTypeId) ?? 0) + amount);
      byCategory.set(e.categoryId, (byCategory.get(e.categoryId) ?? 0) + amount);
    }

    const weeklyBalance = await this.prisma.weeklyBalance.upsert({
      where: {
        periodId_weekNumber: { periodId: dto.periodId, weekNumber: dto.weekNumber },
      },
      create: {
        periodId: dto.periodId,
        weekNumber: dto.weekNumber,
        startDate: start,
        endDate: end,
        budget: dto.budget,
        totalSpent,
      },
      update: { totalSpent, startDate: start, endDate: end },
    });

    await Promise.all([
      this.prisma.weeklyBalanceByTypeItem.deleteMany({
        where: { weeklyBalanceId: weeklyBalance.id },
      }),
      this.prisma.weeklyBalanceByCategoryItem.deleteMany({
        where: { weeklyBalanceId: weeklyBalance.id },
      }),
    ]);

    await Promise.all([
      this.prisma.weeklyBalanceByTypeItem.createMany({
        data: Array.from(byType.entries()).map(([expenseTypeId, amount]) => ({
          weeklyBalanceId: weeklyBalance.id,
          expenseTypeId,
          amount,
        })),
      }),
      this.prisma.weeklyBalanceByCategoryItem.createMany({
        data: Array.from(byCategory.entries()).map(([categoryId, amount]) => ({
          weeklyBalanceId: weeklyBalance.id,
          categoryId,
          amount,
        })),
      }),
    ]);

    return weeklyBalance;
  }

  public async findAllByPeriod(periodId: string) {
    return this.prisma.weeklyBalance.findMany({
      where: { periodId },
      include: { byTypeItems: true, byCategoryItems: true },
      orderBy: { weekNumber: 'asc' },
    });
  }

  public async findOne(id: string) {
    return this.prisma.weeklyBalance.findUnique({
      where: { id },
      include: { byTypeItems: true, byCategoryItems: true },
    });
  }

  public async setBudget(id: string, budget: number) {
    return this.prisma.weeklyBalance.update({
      where: { id },
      data: { budget },
    });
  }

  public async delete(id: string) {
    return this.prisma.weeklyBalance.delete({ where: { id } });
  }
}
