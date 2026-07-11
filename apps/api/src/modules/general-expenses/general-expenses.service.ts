import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGeneralExpenseDto, UpdateGeneralExpenseDto } from './dto';

@Injectable()
export class GeneralExpensesService {
  public constructor(private readonly prisma: PrismaService) {}

  public create(dto: CreateGeneralExpenseDto) {
    return this.prisma.generalExpense.create({
      data: {
        ...dto,
        expectedPayAt: dto.expectedPayAt ? new Date(dto.expectedPayAt) : null,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : null,
      },
    });
  }

  public findAll(periodId?: string) {
    return this.prisma.generalExpense.findMany({
      where: periodId ? { periodId } : undefined,
      include: { expenseType: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public findOne(id: string) {
    return this.prisma.generalExpense.findUnique({
      where: { id },
      include: { expenseType: true, category: true },
    });
  }

  public update(id: string, dto: UpdateGeneralExpenseDto) {
    return this.prisma.generalExpense.update({
      where: { id },
      data: {
        ...dto,
        expectedPayAt: dto.expectedPayAt ? new Date(dto.expectedPayAt) : undefined,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      },
    });
  }

  public remove(id: string) {
    return this.prisma.generalExpense.delete({ where: { id } });
  }
}
