export type Period = {
  id: string;
  year: number;
  month: number;
  createdAt: string;
};

export type Income = {
  id: string;
  periodId: string;
  name: string;
  category: string;
  expectedAmount: string;
  actualAmount: string | null;
  expectedReceiptAt: string | null;
  receivedAt: string | null;
  status: 'PENDING' | 'RECEIVED';
  notes: string | null;
};

export type GeneralExpense = {
  id: string;
  periodId: string;
  expenseTypeId: string;
  categoryId: string;
  name: string;
  estimatedAmount: string;
  actualAmount: string | null;
  expectedPayAt: string | null;
  paidAt: string | null;
  status: 'ESTIMATED' | 'PENDING' | 'PAID';
  paymentMethod: PaymentMethod | null;
  notes: string | null;
};

export type CurrentExpense = {
  id: string;
  periodId: string;
  expenseTypeId: string;
  categoryId: string;
  name: string;
  amount: string;
  paidAt: string;
  paymentMethod: PaymentMethod;
  notes: string | null;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: string;
  targetDate: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  notes: string | null;
  entries: GoalEntry[];
};

export type GoalEntry = {
  id: string;
  goalId: string;
  year: number;
  month: number;
  plannedAmount: string;
  actualAmount: string | null;
};

export type WeeklyBalance = {
  id: string;
  periodId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  budget: string;
  totalSpent: string;
  byTypeItems: { expenseTypeId: string; amount: string }[];
  byCategoryItems: { categoryId: string; amount: string }[];
};

export type Category = { id: string; name: string };
export type ExpenseType = { id: string; name: string; description: string | null };
export type PaymentMethod = 'DEBIT' | 'CREDIT' | 'PIX' | 'CASH' | 'BENEFITS' | 'OTHER';
