import { apiClient } from '../lib/http-client';
import type { Period } from '../lib/types';

type CreatePeriodInput = { year: number; month: number };

export class PeriodsService {
  public list(): Promise<Period[]> {
    return apiClient.get<Period[]>('/periods');
  }

  public get(id: string): Promise<Period> {
    return apiClient.get<Period>(`/periods/${id}`);
  }

  public create(data: CreatePeriodInput): Promise<Period> {
    return apiClient.post<Period>('/periods', data);
  }

  public delete(id: string): Promise<Period> {
    return apiClient.delete<Period>(`/periods/${id}`);
  }
}

export const periodsService = new PeriodsService();
