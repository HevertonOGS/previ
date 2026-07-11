import { apiClient } from '../lib/http-client';
import type { Category, ExpenseType } from '../lib/types';

export type StatusOption = { id: string; name: string };
export type PaymentMethodOption = { id: string; name: string };

export class ReferenceService {
  public categories(kind?: 'INCOME' | 'EXPENSE' | 'BOTH'): Promise<Category[]> {
    const query = kind ? `?kind=${kind}` : '';
    return apiClient.get<Category[]>(`/reference/categories${query}`);
  }

  public expenseTypes(): Promise<ExpenseType[]> {
    return apiClient.get<ExpenseType[]>('/reference/expense-types');
  }

  public createCategory(name: string, kind: 'INCOME' | 'EXPENSE' | 'BOTH' = 'EXPENSE'): Promise<Category> {
    return apiClient.post<Category>('/reference/categories', { name, kind });
  }

  public updateCategory(id: string, name: string): Promise<Category> {
    return apiClient.patch<Category>(`/reference/categories/${id}`, { name });
  }

  public deleteCategory(id: string): Promise<Category> {
    return apiClient.delete<Category>(`/reference/categories/${id}`);
  }

  public createExpenseType(name: string, description?: string): Promise<ExpenseType> {
    return apiClient.post<ExpenseType>('/reference/expense-types', { name, description });
  }

  public updateExpenseType(id: string, name: string, description?: string): Promise<ExpenseType> {
    return apiClient.patch<ExpenseType>(`/reference/expense-types/${id}`, { name, description });
  }

  public deleteExpenseType(id: string): Promise<ExpenseType> {
    return apiClient.delete<ExpenseType>(`/reference/expense-types/${id}`);
  }

  // ── Income Status Options ────────────────────────────────────────────

  public incomeStatusOptions(): Promise<StatusOption[]> {
    return apiClient.get<StatusOption[]>('/reference/income-status-options');
  }

  public createIncomeStatusOption(name: string): Promise<StatusOption> {
    return apiClient.post<StatusOption>('/reference/income-status-options', { name });
  }

  public deleteIncomeStatusOption(id: string): Promise<StatusOption> {
    return apiClient.delete<StatusOption>(`/reference/income-status-options/${id}`);
  }

  // ── Expense Status Options ───────────────────────────────────────────

  public expenseStatusOptions(): Promise<StatusOption[]> {
    return apiClient.get<StatusOption[]>('/reference/expense-status-options');
  }

  public createExpenseStatusOption(name: string): Promise<StatusOption> {
    return apiClient.post<StatusOption>('/reference/expense-status-options', { name });
  }

  public deleteExpenseStatusOption(id: string): Promise<StatusOption> {
    return apiClient.delete<StatusOption>(`/reference/expense-status-options/${id}`);
  }

  // ── Payment Method Options ───────────────────────────────────────────

  public paymentMethodOptions(): Promise<PaymentMethodOption[]> {
    return apiClient.get<PaymentMethodOption[]>('/reference/payment-method-options');
  }

  public createPaymentMethodOption(name: string): Promise<PaymentMethodOption> {
    return apiClient.post<PaymentMethodOption>('/reference/payment-method-options', { name });
  }

  public deletePaymentMethodOption(id: string): Promise<PaymentMethodOption> {
    return apiClient.delete<PaymentMethodOption>(`/reference/payment-method-options/${id}`);
  }

  // ── Source Options ───────────────────────────────────────────────────

  public sourceOptions(): Promise<StatusOption[]> {
    return apiClient.get<StatusOption[]>('/reference/source-options');
  }

  public createSourceOption(name: string): Promise<StatusOption> {
    return apiClient.post<StatusOption>('/reference/source-options', { name });
  }

  public deleteSourceOption(id: string): Promise<StatusOption> {
    return apiClient.delete<StatusOption>(`/reference/source-options/${id}`);
  }
}

export const referenceService = new ReferenceService();
