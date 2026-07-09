import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { weeklyBalancesService } from '../../../../services/weekly-balances.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const e = new Date(end).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return `${s} – ${e}`;
}

type Props = { params: Promise<{ id: string }> };

export default async function WeeklyBalancePage({ params }: Props) {
  const { id } = await params;
  let balances: Awaited<ReturnType<typeof weeklyBalancesService.list>> = [];

  try {
    balances = await weeklyBalancesService.list(id);
  } catch {
    // API unavailable
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/periodos/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Balanço Semanal</h1>
      </div>

      {balances.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum balanço semanal calculado ainda. Use o endpoint de cálculo para gerar.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {balances.map((balance) => {
            const budget = Number(balance.budget);
            const spent = Number(balance.totalSpent);
            const remaining = budget - spent;
            const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
            const isOver = spent > budget;

            return (
              <Card key={balance.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Semana {balance.weekNumber}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {formatDateRange(balance.startDate, balance.endDate)}
                      </span>
                    </CardTitle>
                    <Badge variant={isOver ? 'destructive' : 'success'}>
                      {isOver ? 'Acima do orçamento' : 'Dentro do orçamento'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gasto</span>
                    <span className={`font-semibold ${isOver ? 'text-red-500' : ''}`}>
                      {formatCurrency(spent)} / {formatCurrency(budget)}
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-primary'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(0)}% utilizado</span>
                    <span>
                      {isOver
                        ? `${formatCurrency(Math.abs(remaining))} acima`
                        : `${formatCurrency(remaining)} restante`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
