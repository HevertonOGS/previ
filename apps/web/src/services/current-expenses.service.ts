import { apiClient } from '../lib/http-client';
import type { CurrentExpense } from '../lib/types';

type CreateCurrentExpenseInput = Omit<CurrentExpense, 'id'>;
type UpdateCurrentExpenseInput = Partial<CreateCurrentExpenseInput>;

export class CurrentExpensesService {
  public list(periodId: string): Promise<CurrentExpense[]> {
    return apiClient.get<CurrentExpense[]>(`/current-expenses?periodId=${periodId}`);
  }

  public get(id: string): Promise<CurrentExpense> {
    return apiClient.get<CurrentExpense>(`/current-expenses/${id}`);
  }

  public create(data: CreateCurrentExpenseInput): Promise<CurrentExpense> {
    return apiClient.post<CurrentExpense>('/current-expenses', data);
  }

  public update(id: string, data: UpdateCurrentExpenseInput): Promise<CurrentExpense> {
    return apiClient.patch<CurrentExpense>(`/current-expenses/${id}`, data);
  }

  public delete(id: string): Promise<CurrentExpense> {
    return apiClient.delete<CurrentExpense>(`/current-expenses/${id}`);
  }
}

export const currentExpensesService = new CurrentExpensesService();
