import { Injectable } from '@nestjs/common';

import { IMPORT_FIELD_DEFS, type ImportEntityType, type ImportFieldDef } from 'shared-types';

import { PrismaService } from '../../prisma/prisma.service';

import type { ConfirmSpreadsheetImportDto } from './dto/confirm-spreadsheet-import.dto';
import { resolveByName } from './lookup-resolver';
import { extractRow, parseSpreadsheet, type ParsedSpreadsheet } from './parsers/spreadsheet.parser';

interface LookupRecord {
  id: string;
  name: string;
}

export interface SkippedRow {
  tempId: string;
  missingFields: string[];
}

@Injectable()
export class SpreadsheetImportService {
  public constructor(private readonly prisma: PrismaService) {}

  public parseFile(buffer: Buffer, entityType: ImportEntityType): ParsedSpreadsheet {
    return parseSpreadsheet(buffer.toString('utf-8'), entityType);
  }

  public async confirm(dto: ConfirmSpreadsheetImportDto): Promise<{ created: number; skipped: SkippedRow[] }> {
    const extracted = dto.rows.map((row) => ({
      tempId: row.tempId,
      ...extractRow(row.raw, dto.mapping, dto.entityType),
    }));

    const skipped = extracted
      .filter((r) => r.missingRequired.length > 0)
      .map((r) => ({ tempId: r.tempId, missingFields: r.missingRequired }));
    const validRows = extracted.filter((r) => r.missingRequired.length === 0);

    if (validRows.length === 0) return { created: 0, skipped };

    const fieldDefs = IMPORT_FIELD_DEFS[dto.entityType];
    const lookupResults = new Map<string, Map<string, LookupRecord>>();

    for (const def of fieldDefs) {
      if (!def.kind.startsWith('lookup-')) continue;
      const names = validRows.map((r) => r.values[def.key] as string | null);
      lookupResults.set(def.key, await resolveByName(this.delegateForKind(def.kind), names));
    }

    const data = validRows.map((r) => this.toPrismaData(dto.periodId, r.values, lookupResults, fieldDefs));

    const result = await this.modelFor(dto.entityType).createMany({ data });
    return { created: result.count, skipped };
  }

  private toPrismaData(
    periodId: string,
    values: Record<string, string | number | null>,
    lookupResults: Map<string, Map<string, LookupRecord>>,
    fieldDefs: ImportFieldDef[],
  ): Record<string, unknown> {
    const data: Record<string, unknown> = { periodId };

    for (const def of fieldDefs) {
      const value = values[def.key];

      if (def.kind === 'lookup-expense-type') {
        data.expenseTypeId = value ? (lookupResults.get(def.key)?.get(value as string)?.id ?? null) : null;
      } else if (def.kind === 'lookup-category') {
        data.categoryId = value ? (lookupResults.get(def.key)?.get(value as string)?.id ?? null) : null;
      } else if (def.kind.startsWith('lookup-')) {
        data[def.key] = value ? (lookupResults.get(def.key)?.get(value as string)?.name ?? null) : null;
      } else if (def.kind === 'date') {
        data[def.key] = value ? new Date(value as string) : null;
      } else {
        data[def.key] = value;
      }
    }

    return data;
  }

  private delegateForKind(kind: ImportFieldDef['kind']): {
    findMany(args: { where: { name: { in: string[] } } }): Promise<LookupRecord[]>;
    createMany(args: {
      data: ({ name: string } & Record<string, unknown>)[];
      skipDuplicates: boolean;
    }): Promise<{ count: number }>;
  } {
    switch (kind) {
      case 'lookup-expense-type':
        return this.prisma.expenseType;
      case 'lookup-category':
        return this.prisma.category;
      case 'lookup-payment-method':
        return this.prisma.paymentMethodOption;
      case 'lookup-status-income':
        return this.prisma.incomeStatusOption;
      case 'lookup-status-expense':
        return this.prisma.expenseStatusOption;
      case 'lookup-source':
        return this.prisma.sourceOption;
      default:
        throw new Error(`Unknown lookup kind: ${kind}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private modelFor(entityType: ImportEntityType): { createMany(args: { data: any[] }): Promise<{ count: number }> } {
    switch (entityType) {
      case 'income':
        return this.prisma.income;
      case 'general-expense':
        return this.prisma.generalExpense;
      case 'current-expense':
        return this.prisma.currentExpense;
    }
  }
}
