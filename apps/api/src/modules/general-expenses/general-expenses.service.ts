import { Injectable } from '@nestjs/common';
import { GeneralExpense, Prisma } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateGeneralExpenseDto, UpdateGeneralExpenseDto } from './dto';

export type GeneralExpenseWithRelations = Prisma.GeneralExpenseGetPayload<{
  include: { expenseType: true; category: true };
}>;

@Injectable()
export class GeneralExpensesService {
  public constructor(private readonly prisma: PrismaService) {}

  public create(dto: CreateGeneralExpenseDto): Promise<GeneralExpense> {
    return this.prisma.generalExpense.create({
      data: {
        ...dto,
        expectedPayAt: dto.expectedPayAt ? new Date(dto.expectedPayAt) : null,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : null,
      },
    });
  }

  public findAll(periodId?: string): Promise<GeneralExpenseWithRelations[]> {
    return this.prisma.generalExpense.findMany({
      where: periodId ? { periodId } : undefined,
      include: { expenseType: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public findOne(id: string): Promise<GeneralExpenseWithRelations | null> {
    return this.prisma.generalExpense.findUnique({
      where: { id },
      include: { expenseType: true, category: true },
    });
  }

  public update(id: string, dto: UpdateGeneralExpenseDto): Promise<GeneralExpense> {
    return this.prisma.generalExpense.update({
      where: { id },
      data: {
        ...dto,
        expectedPayAt: dto.expectedPayAt ? new Date(dto.expectedPayAt) : undefined,
        paidAt: dto.paidAt ? new Date(dto.paidAt) : undefined,
      },
    });
  }

  public remove(id: string): Promise<GeneralExpense> {
    return this.prisma.generalExpense.delete({ where: { id } });
  }
}
