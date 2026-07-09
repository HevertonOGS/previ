import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGeneralExpenseDto, UpdateGeneralExpenseDto } from './dto';

@Injectable()
export class GeneralExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateGeneralExpenseDto) {
    return this.prisma.generalExpense.create({ data: dto });
  }

  findAll(periodId?: string) {
    return this.prisma.generalExpense.findMany({
      where: periodId ? { periodId } : undefined,
      include: { expenseType: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.generalExpense.findUnique({
      where: { id },
      include: { expenseType: true, category: true },
    });
  }

  update(id: string, dto: UpdateGeneralExpenseDto) {
    return this.prisma.generalExpense.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.generalExpense.delete({ where: { id } });
  }
}
