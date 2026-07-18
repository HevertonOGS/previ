import { apiClient } from '../lib/http-client';

export type NotionTableType = 'incomes' | 'general-expenses' | 'current-expenses' | 'goals';

export interface ParsedNotionIncome {
  tempId: string; name: string; category: string;
  expectedAmount: number; actualAmount: number | null;
  expectedReceiptAt: string | null; receivedAt: string | null;
  status: 'PENDING' | 'RECEIVED';
}

export interface ParsedNotionGeneralExpense {
  tempId: string; name: string; expenseTypeName: string; categoryName: string;
  estimatedAmount: number; actualAmount: number | null;
  expectedPayAt: string | null; paidAt: string | null;
  status: 'ESTIMATED' | 'PENDING' | 'PAID'; paymentMethodRaw: string | null;
}

export interface ParsedNotionCurrentExpense {
  tempId: string; name: string; expenseTypeName: string; categoryName: string;
  amount: number; paidAt: string; paymentMethodRaw: string;
}

export interface ParsedNotionGoalEntry {
  tempId: string; year: number; month: number;
  plannedAmount: number; actualAmount: number | null;
}

export type ParsedNotionRow =
  | ParsedNotionIncome
  | ParsedNotionGeneralExpense
  | ParsedNotionCurrentExpense
  | ParsedNotionGoalEntry;

export class NotionImportService {
  public async parseFile(file: File, type: NotionTableType): Promise<ParsedNotionRow[]> {
    const formData = new FormData();
    formData.append('file', file);

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const res = await fetch(`${apiBase}/import/notion/parse?type=${type}`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error(await res.text() || 'Erro ao processar arquivo.');
    const data = await res.json() as { rows: ParsedNotionRow[] };
    return data.rows;
  }

  public confirmIncomes(
    periodId: string,
    rows: ParsedNotionIncome[],
  ): Promise<{ created: number }> {
    return apiClient.post<{ created: number }>('/import/notion/incomes/confirm', { periodId, rows });
  }

  public confirmGeneralExpenses(
    periodId: string,
    rows: ParsedNotionGeneralExpense[],
  ): Promise<{ created: number }> {
    return apiClient.post<{ created: number }>('/import/notion/general-expenses/confirm', { periodId, rows });
  }

  public confirmCurrentExpenses(
    periodId: string,
    rows: ParsedNotionCurrentExpense[],
  ): Promise<{ created: number }> {
    return apiClient.post<{ created: number }>('/import/notion/current-expenses/confirm', { periodId, rows });
  }

  public confirmGoals(goalId: string, rows: ParsedNotionGoalEntry[]): Promise<{ created: number }> {
    return apiClient.post<{ created: number }>('/import/notion/goals/confirm', { goalId, rows });
  }
}

export const notionImportService = new NotionImportService();
