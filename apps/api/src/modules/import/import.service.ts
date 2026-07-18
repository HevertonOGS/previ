import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import type { ConfirmImportDto } from './dto';
import { parseCSV } from './parsers/csv.parser';
import { parseOFX, type ParsedTransaction } from './parsers/ofx.parser';

export type StatementFileType = 'ofx' | 'csv';

@Injectable()
export class ImportService {
  public constructor(private readonly prisma: PrismaService) {}

  public parseStatement(fileBuffer: Buffer, type: StatementFileType): ParsedTransaction[] {
    const content = fileBuffer.toString('utf-8');
    if (type === 'ofx') return parseOFX(content);
    return parseCSV(content);
  }

  public async confirmImport(dto: ConfirmImportDto): Promise<{ created: number }> {
    const result = await this.prisma.currentExpense.createMany({
      data: dto.transactions.map((t) => ({
        periodId: dto.periodId,
        expenseTypeId: dto.expenseTypeId,
        categoryId: dto.categoryId,
        name: t.description,
        amount: t.amount,
        paidAt: new Date(t.date),
        paymentMethod: dto.paymentMethod as never,
        notes: dto.notes ?? null,
      })),
    });

    return { created: result.count };
  }
}
