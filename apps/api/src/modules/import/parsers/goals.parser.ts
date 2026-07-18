import { randomUUID } from 'node:crypto';

import { parseRows, parseAmount, parseDate } from './csv-helpers';

export interface ParsedGoalEntry {
  tempId: string;
  year: number;
  month: number;
  plannedAmount: number;
  actualAmount: number | null;
}

function col(row: Record<string, string>, ...candidates: string[]): string {
  for (const key of Object.keys(row)) {
    for (const c of candidates) {
      if (key.toLowerCase().trim() === c.toLowerCase().trim()) return row[key] ?? '';
    }
  }
  return '';
}

export function parseGoalEntries(content: string): ParsedGoalEntry[] {
  return parseRows(content)
    .map((row) => {
      const monthRaw = col(row, 'mês', 'mes', 'month', 'data');
      const plannedRaw = col(row, 'valor previsto', 'planned', 'previsto');
      const actualRaw = col(row, 'valor efetivamente guardado', 'actual', 'guardado', 'realizado');

      const date = parseDate(monthRaw) ?? parseMonthYear(monthRaw);
      const plannedAmount = parseAmount(plannedRaw);

      if (!date || plannedAmount === 0) return null;

      const [year, month] = date.split('-').map(Number);

      return {
        tempId: randomUUID() as string,
        year,
        month,
        plannedAmount,
        actualAmount: actualRaw ? parseAmount(actualRaw) : null,
      } as ParsedGoalEntry;
    })
    .filter((r): r is ParsedGoalEntry => r !== null);
}

function parseMonthYear(raw: string): string | null {
  // "Janeiro 2025", "Jan/2025", "01/2025"
  const monthMap: Record<string, string> = {
    janeiro: '01', fevereiro: '02', março: '03', marco: '03',
    abril: '04', maio: '05', junho: '06', julho: '07',
    agosto: '08', setembro: '09', outubro: '10', novembro: '11', dezembro: '12',
    jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06',
    jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12',
  };

  const parts = raw.toLowerCase().replace(/[/\-,\s]+/g, ' ').trim().split(' ');
  let month: string | null = null;
  let year: string | null = null;

  for (const part of parts) {
    if (monthMap[part]) month = monthMap[part];
    if (/^\d{4}$/.test(part)) year = part;
    if (/^\d{2}$/.test(part) && !month) month = part.padStart(2, '0');
  }

  if (month && year) return `${year}-${month}-01`;
  return null;
}
