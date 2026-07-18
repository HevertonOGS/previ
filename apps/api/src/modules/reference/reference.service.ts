import { Injectable } from '@nestjs/common';
import {
  Category,
  ExpenseStatusOption,
  ExpenseType,
  IncomeStatusOption,
  PaymentMethodOption,
  SourceOption,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateCategoryDto, CreateExpenseTypeDto, CreateStatusOptionDto, UpdateStatusOptionDto } from './dto';

@Injectable()
export class ReferenceService {
  public constructor(private readonly prisma: PrismaService) {}

  public createCategory(dto: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({ data: dto });
  }

  public findAllCategories(kind?: string): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: kind ? { kind: kind as never } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  public findCategoryById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { id } });
  }

  public updateCategory(id: string, dto: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  public deleteCategory(id: string): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }

  public createExpenseType(dto: CreateExpenseTypeDto): Promise<ExpenseType> {
    return this.prisma.expenseType.create({ data: dto });
  }

  public findAllExpenseTypes(): Promise<ExpenseType[]> {
    return this.prisma.expenseType.findMany({ orderBy: { name: 'asc' } });
  }

  public findExpenseTypeById(id: string): Promise<ExpenseType | null> {
    return this.prisma.expenseType.findUnique({ where: { id } });
  }

  public updateExpenseType(id: string, dto: CreateExpenseTypeDto): Promise<ExpenseType> {
    return this.prisma.expenseType.update({ where: { id }, data: dto });
  }

  public deleteExpenseType(id: string): Promise<ExpenseType> {
    return this.prisma.expenseType.delete({ where: { id } });
  }

  // ── Income Status Options ────────────────────────────────────────────

  public createIncomeStatusOption(dto: CreateStatusOptionDto): Promise<IncomeStatusOption> {
    return this.prisma.incomeStatusOption.create({
      data: { id: crypto.randomUUID(), name: dto.name, color: dto.color },
    });
  }

  public findAllIncomeStatusOptions(): Promise<IncomeStatusOption[]> {
    return this.prisma.incomeStatusOption.findMany({ orderBy: { name: 'asc' } });
  }

  public updateIncomeStatusOption(
    id: string,
    dto: UpdateStatusOptionDto,
  ): Promise<IncomeStatusOption> {
    return this.prisma.incomeStatusOption.update({ where: { id }, data: dto });
  }

  public deleteIncomeStatusOption(id: string): Promise<IncomeStatusOption> {
    return this.prisma.incomeStatusOption.delete({ where: { id } });
  }

  // ── Expense Status Options ───────────────────────────────────────────

  public createExpenseStatusOption(dto: CreateStatusOptionDto): Promise<ExpenseStatusOption> {
    return this.prisma.expenseStatusOption.create({
      data: { id: crypto.randomUUID(), name: dto.name, color: dto.color },
    });
  }

  public findAllExpenseStatusOptions(): Promise<ExpenseStatusOption[]> {
    return this.prisma.expenseStatusOption.findMany({ orderBy: { name: 'asc' } });
  }

  public updateExpenseStatusOption(
    id: string,
    dto: UpdateStatusOptionDto,
  ): Promise<ExpenseStatusOption> {
    return this.prisma.expenseStatusOption.update({ where: { id }, data: dto });
  }

  public deleteExpenseStatusOption(id: string): Promise<ExpenseStatusOption> {
    return this.prisma.expenseStatusOption.delete({ where: { id } });
  }

  // ── Payment Method Options ───────────────────────────────────────────

  public createPaymentMethodOption(name: string): Promise<PaymentMethodOption> {
    return this.prisma.paymentMethodOption.create({ data: { id: crypto.randomUUID(), name } });
  }

  public findAllPaymentMethodOptions(): Promise<PaymentMethodOption[]> {
    return this.prisma.paymentMethodOption.findMany({ orderBy: { name: 'asc' } });
  }

  public deletePaymentMethodOption(id: string): Promise<PaymentMethodOption> {
    return this.prisma.paymentMethodOption.delete({ where: { id } });
  }

  // ── Source Options ───────────────────────────────────────────────────

  public createSourceOption(name: string): Promise<SourceOption> {
    return this.prisma.sourceOption.create({ data: { id: crypto.randomUUID(), name } });
  }

  public findAllSourceOptions(): Promise<SourceOption[]> {
    return this.prisma.sourceOption.findMany({ orderBy: { name: 'asc' } });
  }

  public deleteSourceOption(id: string): Promise<SourceOption> {
    return this.prisma.sourceOption.delete({ where: { id } });
  }
}
