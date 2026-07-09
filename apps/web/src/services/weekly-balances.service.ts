import { apiClient } from '../lib/http-client';
import type { WeeklyBalance } from '../lib/types';

type CalculateInput = {
  periodId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  budget: number;
};

export class WeeklyBalancesService {
  public list(periodId: string): Promise<WeeklyBalance[]> {
    return apiClient.get<WeeklyBalance[]>(`/weekly-balances?periodId=${periodId}`);
  }

  public get(id: string): Promise<WeeklyBalance> {
    return apiClient.get<WeeklyBalance>(`/weekly-balances/${id}`);
  }

  public calculate(data: CalculateInput): Promise<WeeklyBalance> {
    return apiClient.post<WeeklyBalance>('/weekly-balances/calculate', data);
  }

  public setBudget(id: string, budget: number): Promise<WeeklyBalance> {
    return apiClient.patch<WeeklyBalance>(`/weekly-balances/${id}/budget`, { budget });
  }

  public delete(id: string): Promise<WeeklyBalance> {
    return apiClient.delete<WeeklyBalance>(`/weekly-balances/${id}`);
  }
}

export const weeklyBalancesService = new WeeklyBalancesService();
