import { randomUUID } from 'node:crypto';

import { parse } from 'csv-parse/sync';

import type { ParsedTransaction } from './ofx.parser';

export interface CsvColumnMapping {
  date: string;
  description: string;
  amount: string;
  // optional: column that indicates sign (debit/credit)
  type?: string;
}

const DEFAULT_MAPPING: CsvColumnMapping = {
  date: 'Data',
  description: 'Descrição',
  amount: 'Valor',
};

// Known bank CSV formats
const BANK_MAPPINGS: { detect: (headers: string[]) => boolean; mapping: CsvColumnMapping }[] = [
  {
    // Nubank
    detect: (h) => h.includes('date') && h.includes('title') && h.includes('amount'),
    mapping: { date: 'date', description: 'title', amount: 'amount' },
  },
  {
    // Itaú / Bradesco style
    detect: (h) => h.some((c) => c.toLowerCase().includes('lançamento')),
    mapping: { date: 'Data', description: 'Lançamento', amount: 'Valor' },
  },
  {
    // Generic pt-BR
    detect: (h) => h.includes('Data') && h.includes('Descrição') && h.includes('Valor'),
    mapping: DEFAULT_MAPPING,
  },
];

function detectDelimiter(content: string): string {
  const firstLine = content.split('\n')[0] ?? '';
  const semicolons = (firstLine.match(/;/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  return semicolons >= commas ? ';' : ',';
}

export function parseCSV(
  content: string,
  customMapping?: Partial<CsvColumnMapping>,
): ParsedTransaction[] {
  const delimiter = detectDelimiter(content);
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    delimiter,
  }) as Record<string, string>[];

  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const bankFormat = BANK_MAPPINGS.find((b) => b.detect(headers));
  const mapping: CsvColumnMapping = {
    ...DEFAULT_MAPPING,
    ...(bankFormat?.mapping ?? {}),
    ...(customMapping ?? {}),
  };

  return rows
    .map((row) => {
      const rawDate = row[mapping.date];
      const description = row[mapping.description] ?? '';
      const rawAmount = row[mapping.amount] ?? '';

      const amount = Math.abs(parseDecimalAmount(rawAmount));

      if (!rawDate || isNaN(amount) || amount === 0) return null;

      const date = parseCSVDate(rawDate);
      if (!date) return null;

      return {
        tempId: randomUUID() as string,
        date,
        description: description.trim(),
        amount,
      } as ParsedTransaction;
    })
    .filter((t): t is ParsedTransaction => t !== null);
}

function parseDecimalAmount(raw: string): number {
  const cleaned = raw.trim().replace(/[^\d.,-]/g, '');

  // Has both dot and comma: determine which is decimal
  if (cleaned.includes('.') && cleaned.includes(',')) {
    const dotIndex = cleaned.lastIndexOf('.');
    const commaIndex = cleaned.lastIndexOf(',');
    if (commaIndex > dotIndex) {
      // comma is decimal separator: 1.234,56
      return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
    } else {
      // dot is decimal separator: 1,234.56
      return parseFloat(cleaned.replace(/,/g, ''));
    }
  }

  // Only comma: could be decimal (150,00) or thousands (1,234)
  if (cleaned.includes(',') && !cleaned.includes('.')) {
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      return parseFloat(cleaned.replace(',', '.'));
    }
    return parseFloat(cleaned.replace(/,/g, ''));
  }

  return parseFloat(cleaned);
}

function parseCSVDate(raw: string): string | null {
  // DD/MM/YYYY
  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw.trim());
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;

  // YYYY-MM-DD
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
  if (ymd) return raw.trim();

  return null;
}
