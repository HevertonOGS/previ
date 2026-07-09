import { apiClient } from '../lib/http-client';

export interface ParsedTransaction {
  tempId: string;
  date: string;
  description: string;
  amount: number;
}

interface ConfirmImportInput {
  periodId: string;
  expenseTypeId: string;
  categoryId: string;
  paymentMethod: string;
  notes?: string;
  transactions: ParsedTransaction[];
}

export class ImportService {
  public async parseStatement(file: File): Promise<ParsedTransaction[]> {
    const formData = new FormData();
    formData.append('file', file);

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const res = await fetch(`${apiBase}/import/statement/parse`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || 'Erro ao processar o arquivo.');
    }

    const data = await res.json() as { transactions: ParsedTransaction[] };
    return data.transactions;
  }

  public async confirmImport(input: ConfirmImportInput): Promise<{ created: number }> {
    return apiClient.post<{ created: number }>('/import/statement/confirm', input);
  }
}

export const importService = new ImportService();
