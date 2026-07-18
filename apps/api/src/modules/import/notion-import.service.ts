import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import type {
  ConfirmNotionIncomesDto,
  ConfirmNotionGeneralExpensesDto,
  ConfirmNotionCurrentExpensesDto,
  ConfirmNotionGoalsDto,
} from './dto/confirm-notion-import.dto';
import {
  parseNotionIncomes,
  parseNotionGeneralExpenses,
  parseNotionCurrentExpenses,
  parseNotionGoals,
  type ParsedNotionIncome,
  type ParsedNotionGeneralExpense,
  type ParsedNotionCurrentExpense,
  type ParsedNotionGoalEntry,
} from './parsers/notion.parser';

export type NotionTableType = 'incomes' | 'general-expenses' | 'current-expenses' | 'goals';

const PAYMENT_METHOD_MAP: Record<string, string> = {
  débito: 'DEBIT',
  debit: 'DEBIT',
  crédito: 'CREDIT',
  credito: 'CREDIT',
  credit: 'CREDIT',
  pix: 'PIX',
  dinheiro: 'CASH',
  cash: 'CASH',
  benefícios: 'BENEFITS',
  beneficios: 'BENEFITS',
  flash: 'BENEFITS',
};

@Injectable()
export class NotionImportService {
  public constructor(private readonly prisma: PrismaService) {}

  public parseFile(
    buffer: Buffer,
    type: NotionTableType,
  ):
    | ParsedNotionIncome[]
    | ParsedNotionGeneralExpense[]
    | ParsedNotionCurrentExpense[]
    | ParsedNotionGoalEntry[] {
    const content = buffer.toString('utf-8');
    switch (type) {
      case 'incomes': return parseNotionIncomes(content);
      case 'general-expenses': return parseNotionGeneralExpenses(content);
      case 'current-expenses': return parseNotionCurrentExpenses(content);
      case 'goals': return parseNotionGoals(content);
    }
  }

  public async confirmIncomes(dto: ConfirmNotionIncomesDto): Promise<{ created: number }> {
    const result = await this.prisma.income.createMany({
      data: dto.rows.map((r) => ({
        periodId: dto.periodId,
        name: r.name,
        category: r.category,
        expectedAmount: r.expectedAmount,
        actualAmount: r.actualAmount ?? null,
        expectedReceiptAt: r.expectedReceiptAt ? new Date(r.expectedReceiptAt) : null,
        receivedAt: r.receivedAt ? new Date(r.receivedAt) : null,
        status: r.status as never,
      })),
    });
    return { created: result.count };
  }

  public async confirmGeneralExpenses(dto: ConfirmNotionGeneralExpensesDto): Promise<{ created: number }> {
    const typeIds = await this.resolveExpenseTypes(dto.rows.map((r) => r.expenseTypeName));
    const categoryIds = await this.resolveCategories(dto.rows.map((r) => r.categoryName));

    const result = await this.prisma.generalExpense.createMany({
      data: dto.rows.map((r) => ({
        periodId: dto.periodId,
        expenseTypeId: typeIds[r.expenseTypeName],
        categoryId: categoryIds[r.categoryName],
        name: r.name,
        estimatedAmount: r.estimatedAmount,
        actualAmount: r.actualAmount ?? null,
        expectedPayAt: r.expectedPayAt ? new Date(r.expectedPayAt) : null,
        paidAt: r.paidAt ? new Date(r.paidAt) : null,
        status: r.status as never,
        paymentMethod: this.resolvePaymentMethod(r.paymentMethodRaw ?? null) as never,
      })),
    });
    return { created: result.count };
  }

  public async confirmCurrentExpenses(dto: ConfirmNotionCurrentExpensesDto): Promise<{ created: number }> {
    const typeIds = await this.resolveExpenseTypes(dto.rows.map((r) => r.expenseTypeName));
    const categoryIds = await this.resolveCategories(dto.rows.map((r) => r.categoryName));

    const result = await this.prisma.currentExpense.createMany({
      data: dto.rows.map((r) => ({
        periodId: dto.periodId,
        expenseTypeId: typeIds[r.expenseTypeName],
        categoryId: categoryIds[r.categoryName],
        name: r.name,
        amount: r.amount,
        paidAt: new Date(r.paidAt),
        paymentMethod: (this.resolvePaymentMethod(r.paymentMethodRaw) ?? 'OTHER') as never,
      })),
    });
    return { created: result.count };
  }

  public async confirmGoals(dto: ConfirmNotionGoalsDto): Promise<{ created: number }> {
    const result = await this.prisma.goalEntry.createMany({
      data: dto.rows.map((r) => ({
        goalId: dto.goalId,
        year: r.year,
        month: r.month,
        plannedAmount: r.plannedAmount,
        actualAmount: r.actualAmount ?? null,
      })),
      skipDuplicates: true,
    });
    return { created: result.count };
  }

  private async resolveExpenseTypes(names: string[]): Promise<Record<string, string>> {
    const unique = [...new Set(names)];
    const existing = await this.prisma.expenseType.findMany({
      where: { name: { in: unique } },
    });
    const result: Record<string, string> = {};
    for (const e of existing) result[e.name] = e.id;

    const missing = unique.filter((n) => !result[n]);
    if (missing.length > 0) {
      await this.prisma.expenseType.createMany({
        data: missing.map((name) => ({ name })),
        skipDuplicates: true,
      });
      const created = await this.prisma.expenseType.findMany({
        where: { name: { in: missing } },
      });
      for (const e of created) result[e.name] = e.id;
    }
    return result;
  }

  private async resolveCategories(names: string[]): Promise<Record<string, string>> {
    const unique = [...new Set(names)];
    const existing = await this.prisma.category.findMany({
      where: { name: { in: unique } },
    });
    const result: Record<string, string> = {};
    for (const c of existing) result[c.name] = c.id;

    const missing = unique.filter((n) => !result[n]);
    if (missing.length > 0) {
      await this.prisma.category.createMany({
        data: missing.map((name) => ({ name })),
        skipDuplicates: true,
      });
      const created = await this.prisma.category.findMany({
        where: { name: { in: missing } },
      });
      for (const c of created) result[c.name] = c.id;
    }
    return result;
  }

  private resolvePaymentMethod(raw: string | null): string | null {
    if (!raw) return null;
    return PAYMENT_METHOD_MAP[raw.toLowerCase().trim()] ?? 'OTHER';
  }
}
