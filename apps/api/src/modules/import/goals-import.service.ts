import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import type { ConfirmGoalsImportDto } from './dto/confirm-goals-import.dto';
import { parseGoalEntries, type ParsedGoalEntry } from './parsers/goals.parser';

@Injectable()
export class GoalsImportService {
  public constructor(private readonly prisma: PrismaService) {}

  public parseFile(buffer: Buffer): ParsedGoalEntry[] {
    return parseGoalEntries(buffer.toString('utf-8'));
  }

  public async confirm(dto: ConfirmGoalsImportDto): Promise<{ created: number }> {
    const result = await this.prisma.goalEntry.createMany({
      data: dto.rows.map((r) => ({
        goalId: dto.goalId,
        year: r.year,
        month: r.month,
        plannedAmount: r.plannedAmount,
        actualAmount: r.actualAmount ?? null,
      })),
      skipDuplicates: true,
    });
    return { created: result.count };
  }
}
