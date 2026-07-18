'use client';

import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, type JSX } from 'react';

import type { CurrentExpense } from '../../lib/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

import { DeleteItemButton } from './delete-item-button';

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

const PAYMENT_LABELS: Record<string, string> = {
  DEBIT: 'Débito',
  CREDIT: 'Crédito',
  PIX: 'PIX',
  CASH: 'Dinheiro',
  BENEFITS: 'Benefícios',
  OTHER: 'Outro',
};

interface MethodSummary {
  paymentMethod: string;
  total: number;
}

interface CurrentExpensesBoardProps {
  periodId: string;
  expenses: CurrentExpense[];
}

export function CurrentExpensesBoard({
  periodId,
  expenses,
}: CurrentExpensesBoardProps): JSX.Element {
  const [methodFilter, setMethodFilter] = useState<string | null>(null);

  const total = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

  const methodSummaries = useMemo<MethodSummary[]>(() => {
    const totals = new Map<string, number>();
    for (const expense of expenses) {
      totals.set(expense.paymentMethod, (totals.get(expense.paymentMethod) ?? 0) + Number(expense.amount));
    }
    return Array.from(totals.entries())
      .map(([paymentMethod, total]) => ({ paymentMethod, total }))
      .sort((a, b) => a.paymentMethod.localeCompare(b.paymentMethod, 'pt-BR'));
  }, [expenses]);

  const visibleExpenses = methodFilter
    ? expenses.filter((e) => e.paymentMethod === methodFilter)
    : expenses;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <div className="rounded-lg border bg-card px-5 py-3">
          <p className="text-xs text-muted-foreground">Total gasto</p>
          <p className="text-xl font-bold text-red-500">{formatCurrency(total)}</p>
        </div>
        <div className="rounded-lg border bg-card px-5 py-3">
          <p className="text-xs text-muted-foreground">Lançamentos</p>
          <p className="text-xl font-bold">{expenses.length}</p>
        </div>
        {methodSummaries.map(({ paymentMethod, total }) => {
          const active = methodFilter === paymentMethod;
          return (
            <button
              key={paymentMethod}
              type="button"
              onClick={() => setMethodFilter(active ? null : paymentMethod)}
              className={`rounded-lg border px-5 py-3 text-left transition-colors ${
                active ? 'border-primary bg-primary/5' : 'bg-card hover:bg-muted/50'
              }`}
            >
              <p className="text-xs text-muted-foreground">
                {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
              </p>
              <p className="text-xl font-bold text-red-500">{formatCurrency(total)}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        {visibleExpenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {methodFilter
              ? `Nenhum gasto com o método "${PAYMENT_LABELS[methodFilter] ?? methodFilter}".`
              : 'Nenhum gasto corrente lançado.'}
          </p>
        ) : (
          visibleExpenses.map((expense) => (
            <Card key={expense.id} className="group">
              <CardContent className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium">{expense.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(expense.paidAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                  <Badge variant="secondary">
                    {PAYMENT_LABELS[expense.paymentMethod] ?? expense.paymentMethod}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-100 transition-opacity shrink-0 md:opacity-0 md:group-hover:opacity-100" asChild>
                    <Link href={`/periodos/${periodId}/gastos-correntes/${expense.id}/editar`}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </Button>
                  <DeleteItemButton id={expense.id} endpoint="/current-expenses" label={expense.name} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
