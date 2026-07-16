'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import type { GeneralExpense } from '../../lib/types';
import type { StatusOptionWithColor } from '../../services/reference.service';
import { statusColorMeta } from '../../lib/status-colors';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DeleteItemButton } from './delete-item-button';

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

interface StatusSummary {
  status: string;
  total: number;
}

interface GeneralExpensesBoardProps {
  periodId: string;
  expenses: GeneralExpense[];
  statusOptions: StatusOptionWithColor[];
}

export function GeneralExpensesBoard({ periodId, expenses, statusOptions }: GeneralExpensesBoardProps) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const colorByStatus = useMemo(() => {
    const map = new Map<string, string>();
    for (const option of statusOptions) map.set(option.name, option.color);
    return map;
  }, [statusOptions]);

  const totalEstimated = expenses.reduce((acc, e) => acc + Number(e.estimatedAmount), 0);

  const statusSummaries = useMemo<StatusSummary[]>(() => {
    const totals = new Map<string, number>();
    for (const expense of expenses) {
      const amount = Number(expense.actualAmount ?? expense.estimatedAmount);
      totals.set(expense.status, (totals.get(expense.status) ?? 0) + amount);
    }
    return Array.from(totals.entries())
      .map(([status, total]) => ({ status, total }))
      .sort((a, b) => a.status.localeCompare(b.status, 'pt-BR'));
  }, [expenses]);

  const visibleExpenses = statusFilter ? expenses.filter((e) => e.status === statusFilter) : expenses;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <div className="rounded-lg border bg-card px-5 py-3">
          <p className="text-xs text-muted-foreground">Estimado</p>
          <p className="text-xl font-bold">{formatCurrency(totalEstimated)}</p>
        </div>
        {statusSummaries.map(({ status, total }) => {
          const active = statusFilter === status;
          const meta = statusColorMeta(colorByStatus.get(status));
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(active ? null : status)}
              className={`rounded-lg border px-5 py-3 text-left transition-colors ${
                active ? 'border-primary bg-primary/5' : 'bg-card hover:bg-muted/50'
              }`}
            >
              <p className="text-xs text-muted-foreground">{status}</p>
              <p className={`text-xl font-bold ${meta.textClass}`}>{formatCurrency(total)}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        {visibleExpenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {statusFilter ? `Nenhum gasto geral com status "${statusFilter}".` : 'Nenhum gasto geral lançado.'}
          </p>
        ) : (
          visibleExpenses.map((expense) => (
            <Card key={expense.id} className="group">
              <CardContent className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium">{expense.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {expense.paidAt
                      ? `Pago em ${new Date(expense.paidAt).toLocaleDateString('pt-BR')}`
                      : expense.expectedPayAt
                      ? `Vence em ${new Date(expense.expectedPayAt).toLocaleDateString('pt-BR')}`
                      : 'Sem data'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(expense.actualAmount ?? expense.estimatedAmount)}
                    </p>
                    {expense.actualAmount && expense.actualAmount !== expense.estimatedAmount && (
                      <p className="text-xs text-muted-foreground">
                        Estimado: {formatCurrency(expense.estimatedAmount)}
                      </p>
                    )}
                  </div>
                  <Badge variant={statusColorMeta(colorByStatus.get(expense.status)).badgeVariant}>
                    {expense.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-100 transition-opacity shrink-0 md:opacity-0 md:group-hover:opacity-100" asChild>
                    <Link href={`/periodos/${periodId}/gastos-gerais/${expense.id}/editar`}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </Button>
                  <DeleteItemButton id={expense.id} endpoint="/general-expenses" label={expense.name} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
