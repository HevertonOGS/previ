import type { ImportEntityType } from 'shared-types';

import { apiClient } from '../lib/http-client';

export interface SpreadsheetRow {
  tempId: string;
  raw: Record<string, string>;
}

export interface SpreadsheetParseResult {
  headers: string[];
  rows: SpreadsheetRow[];
  suggestedMapping: Record<string, string | null>;
}

export interface ConfirmSpreadsheetImportInput {
  entityType: ImportEntityType;
  periodId: string;
  mapping: Record<string, string | null>;
  rows: SpreadsheetRow[];
}

export interface SkippedRow {
  tempId: string;
  missingFields: string[];
}

export class SpreadsheetImportService {
  public async parseFile(file: File, entityType: ImportEntityType): Promise<SpreadsheetParseResult> {
    const formData = new FormData();
    formData.append('file', file);

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const res = await fetch(`${apiBase}/import/spreadsheet/parse?entityType=${entityType}`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error(await res.text() || 'Erro ao processar arquivo.');
    return res.json() as Promise<SpreadsheetParseResult>;
  }

  public confirm(
    input: ConfirmSpreadsheetImportInput,
  ): Promise<{ created: number; skipped: SkippedRow[] }> {
    return apiClient.post<{ created: number; skipped: SkippedRow[] }>('/import/spreadsheet/confirm', input);
  }
}

export const spreadsheetImportService = new SpreadsheetImportService();
