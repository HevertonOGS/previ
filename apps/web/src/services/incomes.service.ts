import { apiClient } from '../lib/http-client';
import type { Income } from '../lib/types';

type CreateIncomeInput = Omit<Income, 'id'>;
type UpdateIncomeInput = Partial<CreateIncomeInput>;

export class IncomesService {
  public list(periodId: string): Promise<Income[]> {
    return apiClient.get<Income[]>(`/incomes?periodId=${periodId}`);
  }

  public get(id: string): Promise<Income> {
    return apiClient.get<Income>(`/incomes/${id}`);
  }

  public create(data: CreateIncomeInput): Promise<Income> {
    return apiClient.post<Income>('/incomes', data);
  }

  public update(id: string, data: UpdateIncomeInput): Promise<Income> {
    return apiClient.patch<Income>(`/incomes/${id}`, data);
  }

  public delete(id: string): Promise<Income> {
    return apiClient.delete<Income>(`/incomes/${id}`);
  }
}

export const incomesService = new IncomesService();
