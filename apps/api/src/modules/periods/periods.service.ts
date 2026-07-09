import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePeriodDto } from './dto';

@Injectable()
export class PeriodsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePeriodDto) {
    return this.prisma.period.create({ data: dto });
  }

  findAll() {
    return this.prisma.period.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  findOne(id: string) {
    return this.prisma.period.findUnique({
      where: { id },
      include: {
        incomes: true,
        generalExpenses: { include: { expenseType: true, category: true } },
        currentExpenses: { include: { expenseType: true, category: true } },
      },
    });
  }

  remove(id: string) {
    return this.prisma.period.delete({ where: { id } });
  }
}
