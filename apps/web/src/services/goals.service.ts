import { apiClient } from '../lib/http-client';
import type { Goal, GoalEntry } from '../lib/types';

type CreateGoalInput = Omit<Goal, 'id' | 'entries'>;
type UpdateGoalInput = Partial<CreateGoalInput>;
type CreateGoalEntryInput = Omit<GoalEntry, 'id'>;
type UpdateGoalEntryInput = Partial<Pick<GoalEntry, 'plannedAmount' | 'actualAmount'>>;

export class GoalsService {
  public list(): Promise<Goal[]> {
    return apiClient.get<Goal[]>('/goals');
  }

  public get(id: string): Promise<Goal> {
    return apiClient.get<Goal>(`/goals/${id}`);
  }

  public create(data: CreateGoalInput): Promise<Goal> {
    return apiClient.post<Goal>('/goals', data);
  }

  public update(id: string, data: UpdateGoalInput): Promise<Goal> {
    return apiClient.patch<Goal>(`/goals/${id}`, data);
  }

  public delete(id: string): Promise<Goal> {
    return apiClient.delete<Goal>(`/goals/${id}`);
  }

  public createEntry(data: CreateGoalEntryInput): Promise<GoalEntry> {
    return apiClient.post<GoalEntry>('/goals/entries', data);
  }

  public updateEntry(id: string, data: UpdateGoalEntryInput): Promise<GoalEntry> {
    return apiClient.patch<GoalEntry>(`/goals/entries/${id}`, data);
  }

  public deleteEntry(id: string): Promise<GoalEntry> {
    return apiClient.delete<GoalEntry>(`/goals/entries/${id}`);
  }
}

export const goalsService = new GoalsService();
