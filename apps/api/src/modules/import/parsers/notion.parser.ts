import { randomUUID } from 'node:crypto';

import { parse } from 'csv-parse/sync';

// ─────────────────────────────────────────────
// Parsed types
// ─────────────────────────────────────────────

export interface ParsedNotionIncome {
  tempId: string;
  name: string;
  category: string;
  expectedAmount: number;
  actualAmount: number | null;
  expectedReceiptAt: string | null;
  receivedAt: string | null;
  status: 'PENDING' | 'RECEIVED';
}

export interface ParsedNotionGeneralExpense {
  tempId: string;
  name: string;
  expenseTypeName: string;
  categoryName: string;
  estimatedAmount: number;
  actualAmount: number | null;
  expectedPayAt: string | null;
  paidAt: string | null;
  status: 'ESTIMATED' | 'PENDING' | 'PAID';
  paymentMethodRaw: string | null;
}

export interface ParsedNotionCurrentExpense {
  tempId: string;
  name: string;
  expenseTypeName: string;
  categoryName: string;
  amount: number;
  paidAt: string;
  paymentMethodRaw: string;
}

export interface ParsedNotionGoalEntry {
  tempId: string;
  year: number;
  month: number;
  plannedAmount: number;
  actualAmount: number | null;
}

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────

function parseRows(content: string): Record<string, string>[] {
  const delimiter = content.split('\n')[0]?.includes(';') ? ';' : ',';
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    delimiter,
    relax_column_count: true,
  }) as Record<string, string>[];
}

function col(row: Record<string, string>, ...candidates: string[]): string {
  for (const key of Object.keys(row)) {
    for (const c of candidates) {
      if (key.toLowerCase().trim() === c.toLowerCase().trim()) return row[key] ?? '';
    }
  }
  return '';
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^\d,.-]/g, '');
  if (!cleaned) return 0;
  if (cleaned.includes(',') && !cleaned.includes('.')) {
    return Math.abs(parseFloat(cleaned.replace(',', '.')));
  }
  if (cleaned.includes('.') && cleaned.includes(',')) {
    const last = Math.max(cleaned.lastIndexOf('.'), cleaned.lastIndexOf(','));
    const sep = cleaned[last];
    return sep === ','
      ? Math.abs(parseFloat(cleaned.replace(/\./g, '').replace(',', '.')))
      : Math.abs(parseFloat(cleaned.replace(/,/g, '')));
  }
  return Math.abs(parseFloat(cleaned));
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  // DD/MM/YYYY
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw.trim());
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return raw.trim();
  return null;
}

function parseIncomeStatus(raw: string): 'PENDING' | 'RECEIVED' {
  const v = raw.toLowerCase();
  if (v.includes('receb') || v.includes('pago') || v === 'done') return 'RECEIVED';
  return 'PENDING';
}

function parseExpenseStatus(raw: string): 'ESTIMATED' | 'PENDING' | 'PAID' {
  const v = raw.toLowerCase();
  if (v.includes('pago') || v.includes('paid') || v === 'done') return 'PAID';
  if (v.includes('pendente') || v.includes('pending')) return 'PENDING';
  return 'ESTIMATED';
}

// ─────────────────────────────────────────────
// Parsers
// ─────────────────────────────────────────────

export function parseNotionIncomes(content: string): ParsedNotionIncome[] {
  return parseRows(content)
    .map((row) => {
      const name = col(row, 'receita', 'nome', 'name', 'título', 'title');
      const expectedRaw = col(row, 'valor', 'value', 'valor previsto', 'expected amount');
      const actualRaw = col(row, 'valor recebido', 'actual amount', 'recebido');
      const expectedAmount = parseAmount(expectedRaw);

      if (!name || expectedAmount === 0) return null;

      return {
        tempId: randomUUID() as string,
        name,
        category: col(row, 'categoria', 'category') || 'Outros',
        expectedAmount,
        actualAmount: actualRaw ? parseAmount(actualRaw) : null,
        expectedReceiptAt: parseDate(col(row, 'previsão de recebimento', 'expected receipt', 'previsão')),
        receivedAt: parseDate(col(row, 'recebido em', 'received at', 'data de recebimento')),
        status: parseIncomeStatus(col(row, 'status')),
      } as ParsedNotionIncome;
    })
    .filter((r): r is ParsedNotionIncome => r !== null);
}

export function parseNotionGeneralExpenses(content: string): ParsedNotionGeneralExpense[] {
  return parseRows(content)
    .map((row) => {
      const name = col(row, 'gasto', 'nome', 'name', 'título', 'title', 'despesa');
      const estimatedRaw = col(row, 'valor estimado', 'estimated', 'valor');
      const actualRaw = col(row, 'valor pago', 'actual', 'pago');
      const estimatedAmount = parseAmount(estimatedRaw);

      if (!name || estimatedAmount === 0) return null;

      return {
        tempId: randomUUID() as string,
        name,
        expenseTypeName: col(row, 'tipo', 'type') || 'Custos Fixos',
        categoryName: col(row, 'categoria', 'category') || 'Outros',
        estimatedAmount,
        actualAmount: actualRaw ? parseAmount(actualRaw) : null,
        expectedPayAt: parseDate(col(row, 'pagar em', 'vencimento', 'due date')),
        paidAt: parseDate(col(row, 'pago em', 'paid at', 'data de pagamento')),
        status: parseExpenseStatus(col(row, 'status')),
        paymentMethodRaw: col(row, 'via de pagamento', 'forma de pagamento', 'payment method') || null,
      } as ParsedNotionGeneralExpense;
    })
    .filter((r): r is ParsedNotionGeneralExpense => r !== null);
}

export function parseNotionCurrentExpenses(content: string): ParsedNotionCurrentExpense[] {
  return parseRows(content)
    .map((row) => {
      const name = col(row, 'gasto', 'nome', 'name', 'título', 'title', 'despesa');
      const amountRaw = col(row, 'valor', 'value', 'amount');
      const paidAtRaw = col(row, 'quando foi pago', 'data', 'date', 'paid at', 'pago em');
      const amount = parseAmount(amountRaw);
      const paidAt = parseDate(paidAtRaw);

      if (!name || amount === 0 || !paidAt) return null;

      return {
        tempId: randomUUID() as string,
        name,
        expenseTypeName: col(row, 'tipo', 'type') || 'Gastos Correntes',
        categoryName: col(row, 'categoria', 'category') || 'Outros',
        amount,
        paidAt,
        paymentMethodRaw: col(row, 'forma de pagamento', 'via de pagamento', 'payment method') || 'OTHER',
      } as ParsedNotionCurrentExpense;
    })
    .filter((r): r is ParsedNotionCurrentExpense => r !== null);
}

export function parseNotionGoals(content: string): ParsedNotionGoalEntry[] {
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
      } as ParsedNotionGoalEntry;
    })
    .filter((r): r is ParsedNotionGoalEntry => r !== null);
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
