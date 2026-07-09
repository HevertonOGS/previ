import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIncomeDto, UpdateIncomeDto } from './dto';

@Injectable()
export class IncomesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateIncomeDto) {
    return this.prisma.income.create({ data: dto });
  }

  findAll(periodId?: string) {
    return this.prisma.income.findMany({
      where: periodId ? { periodId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.income.findUnique({ where: { id } });
  }

  update(id: string, dto: UpdateIncomeDto) {
    return this.prisma.income.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.income.delete({ where: { id } });
  }
}
