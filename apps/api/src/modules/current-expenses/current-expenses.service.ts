import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCurrentExpenseDto, UpdateCurrentExpenseDto } from './dto';

@Injectable()
export class CurrentExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateCurrentExpenseDto) {
    return this.prisma.currentExpense.create({ data: dto });
  }

  findAll(periodId?: string) {
    return this.prisma.currentExpense.findMany({
      where: periodId ? { periodId } : undefined,
      include: { expenseType: true, category: true },
      orderBy: { paidAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.currentExpense.findUnique({
      where: { id },
      include: { expenseType: true, category: true },
    });
  }

  update(id: string, dto: UpdateCurrentExpenseDto) {
    return this.prisma.currentExpense.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.currentExpense.delete({ where: { id } });
  }
}
