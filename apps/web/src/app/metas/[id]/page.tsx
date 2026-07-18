import { ArrowLeft, Target } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';

import { DeleteItemButton } from '../../../components/features/delete-item-button';
import { GoalEntryFormDialog } from '../../../components/features/goal-entry-form-dialog';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { goalsService } from '../../../services/goals.service';

const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatCurrency(value: string | number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativa',
  COMPLETED: 'Concluída',
  PAUSED: 'Pausada',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  ACTIVE: 'default',
  COMPLETED: 'success',
  PAUSED: 'warning',
};

type Props = { params: Promise<{ id: string }> };

export default async function GoalDetailPage({ params }: Props): Promise<JSX.Element> {
  const { id } = await params;
  const goal = await goalsService.get(id).catch(() => notFound());
  if (!goal) notFound();

  const totalActual = goal.entries.reduce((acc, e) => acc + Number(e.actualAmount ?? 0), 0);
  const target = Number(goal.targetAmount);
  const percentage = target > 0 ? Math.min((totalActual / target) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/metas"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">{goal.name}</h1>
        <Badge variant={STATUS_VARIANTS[goal.status]}>{STATUS_LABELS[goal.status]}</Badge>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold">
              {formatCurrency(totalActual)} / {formatCurrency(target)}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-muted-foreground">
            <span>{percentage.toFixed(0)}% atingido</span>
            {goal.targetDate && (
              <span>
                Meta: {new Date(goal.targetDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
          {goal.notes && <p className="text-xs text-muted-foreground border-t pt-2">{goal.notes}</p>}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold">Aportes mensais</h2>
        <GoalEntryFormDialog mode="create" goalId={goal.id} />
      </div>

      {goal.entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium">Nenhum aporte lançado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione um mês para planejar quanto pretende guardar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {goal.entries.map((entry) => (
            <Card key={entry.id} className="group">
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 px-5">
                <p className="font-medium">
                  {MONTH_LABELS[entry.month - 1]} / {entry.year}
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Planejado</p>
                    <p className="font-semibold">{formatCurrency(entry.plannedAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Real</p>
                    <p className="font-semibold">
                      {entry.actualAmount ? formatCurrency(entry.actualAmount) : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <GoalEntryFormDialog mode="edit" entry={entry} />
                    <DeleteItemButton
                      id={entry.id}
                      endpoint="/goals/entries"
                      label={`${MONTH_LABELS[entry.month - 1]}/${entry.year}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
