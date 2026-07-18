'use client';

import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, type JSX } from 'react';

import { statusColorMeta } from '../../lib/status-colors';
import type { Income } from '../../lib/types';
import type { StatusOptionWithColor } from '../../services/reference.service';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

import { DeleteItemButton } from './delete-item-button';

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

interface StatusSummary {
  status: string;
  total: number;
}

interface IncomesBoardProps {
  periodId: string;
  incomes: Income[];
  statusOptions: StatusOptionWithColor[];
}

export function IncomesBoard({
  periodId,
  incomes,
  statusOptions,
}: IncomesBoardProps): JSX.Element {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const colorByStatus = useMemo(() => {
    const map = new Map<string, string>();
    for (const option of statusOptions) map.set(option.name, option.color);
    return map;
  }, [statusOptions]);

  const totalExpected = incomes.reduce((acc, i) => acc + Number(i.expectedAmount), 0);

  const statusSummaries = useMemo<StatusSummary[]>(() => {
    const totals = new Map<string, number>();
    for (const income of incomes) {
      const amount = Number(income.actualAmount ?? income.expectedAmount);
      totals.set(income.status, (totals.get(income.status) ?? 0) + amount);
    }
    return Array.from(totals.entries())
      .map(([status, total]) => ({ status, total }))
      .sort((a, b) => a.status.localeCompare(b.status, 'pt-BR'));
  }, [incomes]);

  const visibleIncomes = statusFilter ? incomes.filter((i) => i.status === statusFilter) : incomes;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <div className="rounded-lg border bg-card px-5 py-3">
          <p className="text-xs text-muted-foreground">Previsto</p>
          <p className="text-xl font-bold">{formatCurrency(totalExpected)}</p>
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
        {visibleIncomes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {statusFilter ? `Nenhuma receita com status "${statusFilter}".` : 'Nenhuma receita lançada.'}
          </p>
        ) : (
          visibleIncomes.map((income) => (
            <Card key={income.id} className="group">
              <CardContent className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium">{income.name}</p>
                  <p className="text-xs text-muted-foreground">{income.category}</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(income.actualAmount ?? income.expectedAmount)}
                    </p>
                    {income.actualAmount && income.actualAmount !== income.expectedAmount && (
                      <p className="text-xs text-muted-foreground">
                        Previsto: {formatCurrency(income.expectedAmount)}
                      </p>
                    )}
                  </div>
                  <Badge variant={statusColorMeta(colorByStatus.get(income.status)).badgeVariant}>
                    {income.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-100 transition-opacity shrink-0 md:opacity-0 md:group-hover:opacity-100" asChild>
                    <Link href={`/periodos/${periodId}/receitas/${income.id}/editar`}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </Button>
                  <DeleteItemButton id={income.id} endpoint="/incomes" label={income.name} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
