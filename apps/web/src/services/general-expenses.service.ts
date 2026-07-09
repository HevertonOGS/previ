import { apiClient } from '../lib/http-client';
import type { GeneralExpense } from '../lib/types';

type CreateGeneralExpenseInput = Omit<GeneralExpense, 'id'>;
type UpdateGeneralExpenseInput = Partial<CreateGeneralExpenseInput>;

export class GeneralExpensesService {
  public list(periodId: string): Promise<GeneralExpense[]> {
    return apiClient.get<GeneralExpense[]>(`/general-expenses?periodId=${periodId}`);
  }

  public get(id: string): Promise<GeneralExpense> {
    return apiClient.get<GeneralExpense>(`/general-expenses/${id}`);
  }

  public create(data: CreateGeneralExpenseInput): Promise<GeneralExpense> {
    return apiClient.post<GeneralExpense>('/general-expenses', data);
  }

  public update(id: string, data: UpdateGeneralExpenseInput): Promise<GeneralExpense> {
    return apiClient.patch<GeneralExpense>(`/general-expenses/${id}`, data);
  }

  public delete(id: string): Promise<GeneralExpense> {
    return apiClient.delete<GeneralExpense>(`/general-expenses/${id}`);
  }
}

export const generalExpensesService = new GeneralExpensesService();
