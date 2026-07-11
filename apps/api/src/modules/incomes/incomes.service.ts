import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIncomeDto, UpdateIncomeDto } from './dto';

@Injectable()
export class IncomesService {
  public constructor(private readonly prisma: PrismaService) {}

  public create(dto: CreateIncomeDto) {
    return this.prisma.income.create({
      data: {
        ...dto,
        expectedReceiptAt: dto.expectedReceiptAt ? new Date(dto.expectedReceiptAt) : null,
        receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : null,
      },
    });
  }

  public findAll(periodId?: string) {
    return this.prisma.income.findMany({
      where: periodId ? { periodId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  public findOne(id: string) {
    return this.prisma.income.findUnique({ where: { id } });
  }

  public update(id: string, dto: UpdateIncomeDto) {
    return this.prisma.income.update({
      where: { id },
      data: {
        ...dto,
        expectedReceiptAt: dto.expectedReceiptAt ? new Date(dto.expectedReceiptAt) : undefined,
        receivedAt: dto.receivedAt ? new Date(dto.receivedAt) : undefined,
      },
    });
  }

  public remove(id: string) {
    return this.prisma.income.delete({ where: { id } });
  }
}
