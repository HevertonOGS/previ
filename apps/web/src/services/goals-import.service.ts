import { apiClient } from '../lib/http-client';

export interface ParsedGoalEntry {
  tempId: string;
  year: number;
  month: number;
  plannedAmount: number;
  actualAmount: number | null;
}

export class GoalsImportService {
  public async parseFile(file: File): Promise<ParsedGoalEntry[]> {
    const formData = new FormData();
    formData.append('file', file);

    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const res = await fetch(`${apiBase}/import/goals/parse`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error(await res.text() || 'Erro ao processar arquivo.');
    const data = await res.json() as { rows: ParsedGoalEntry[] };
    return data.rows;
  }

  public confirmGoals(goalId: string, rows: ParsedGoalEntry[]): Promise<{ created: number }> {
    return apiClient.post<{ created: number }>('/import/goals/confirm', { goalId, rows });
  }
}

export const goalsImportService = new GoalsImportService();
