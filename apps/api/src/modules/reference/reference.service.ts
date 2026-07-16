import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, CreateExpenseTypeDto, CreateStatusOptionDto, UpdateStatusOptionDto } from './dto';

@Injectable()
export class ReferenceService {
  public constructor(private readonly prisma: PrismaService) {}

  public createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  public findAllCategories(kind?: string) {
    return this.prisma.category.findMany({
      where: kind ? { kind: kind as never } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  public findCategoryById(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  public updateCategory(id: string, dto: CreateCategoryDto) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  public deleteCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  public createExpenseType(dto: CreateExpenseTypeDto) {
    return this.prisma.expenseType.create({ data: dto });
  }

  public findAllExpenseTypes() {
    return this.prisma.expenseType.findMany({ orderBy: { name: 'asc' } });
  }

  public findExpenseTypeById(id: string) {
    return this.prisma.expenseType.findUnique({ where: { id } });
  }

  public updateExpenseType(id: string, dto: CreateExpenseTypeDto) {
    return this.prisma.expenseType.update({ where: { id }, data: dto });
  }

  public deleteExpenseType(id: string) {
    return this.prisma.expenseType.delete({ where: { id } });
  }

  // ── Income Status Options ────────────────────────────────────────────

  public createIncomeStatusOption(dto: CreateStatusOptionDto) {
    return this.prisma.incomeStatusOption.create({
      data: { id: crypto.randomUUID(), name: dto.name, color: dto.color },
    });
  }

  public findAllIncomeStatusOptions() {
    return this.prisma.incomeStatusOption.findMany({ orderBy: { name: 'asc' } });
  }

  public updateIncomeStatusOption(id: string, dto: UpdateStatusOptionDto) {
    return this.prisma.incomeStatusOption.update({ where: { id }, data: dto });
  }

  public deleteIncomeStatusOption(id: string) {
    return this.prisma.incomeStatusOption.delete({ where: { id } });
  }

  // ── Expense Status Options ───────────────────────────────────────────

  public createExpenseStatusOption(dto: CreateStatusOptionDto) {
    return this.prisma.expenseStatusOption.create({
      data: { id: crypto.randomUUID(), name: dto.name, color: dto.color },
    });
  }

  public findAllExpenseStatusOptions() {
    return this.prisma.expenseStatusOption.findMany({ orderBy: { name: 'asc' } });
  }

  public updateExpenseStatusOption(id: string, dto: UpdateStatusOptionDto) {
    return this.prisma.expenseStatusOption.update({ where: { id }, data: dto });
  }

  public deleteExpenseStatusOption(id: string) {
    return this.prisma.expenseStatusOption.delete({ where: { id } });
  }

  // ── Payment Method Options ───────────────────────────────────────────

  public createPaymentMethodOption(name: string) {
    return this.prisma.paymentMethodOption.create({ data: { id: crypto.randomUUID(), name } });
  }

  public findAllPaymentMethodOptions() {
    return this.prisma.paymentMethodOption.findMany({ orderBy: { name: 'asc' } });
  }

  public deletePaymentMethodOption(id: string) {
    return this.prisma.paymentMethodOption.delete({ where: { id } });
  }

  // ── Source Options ───────────────────────────────────────────────────

  public createSourceOption(name: string) {
    return this.prisma.sourceOption.create({ data: { id: crypto.randomUUID(), name } });
  }

  public findAllSourceOptions() {
    return this.prisma.sourceOption.findMany({ orderBy: { name: 'asc' } });
  }

  public deleteSourceOption(id: string) {
    return this.prisma.sourceOption.delete({ where: { id } });
  }
}
