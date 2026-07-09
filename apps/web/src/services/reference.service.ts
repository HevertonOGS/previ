import { apiClient } from '../lib/http-client';
import type { Category, ExpenseType } from '../lib/types';

export class ReferenceService {
  public categories(): Promise<Category[]> {
    return apiClient.get<Category[]>('/reference/categories');
  }

  public expenseTypes(): Promise<ExpenseType[]> {
    return apiClient.get<ExpenseType[]>('/reference/expense-types');
  }
}

export const referenceService = new ReferenceService();
