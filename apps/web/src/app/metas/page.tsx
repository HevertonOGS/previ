import { Plus, Target, Pencil, Wallet } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';

import { DeleteItemButton } from '../../components/features/delete-item-button';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { goalsService } from '../../services/goals.service';

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

export default async function GoalsPage(): Promise<JSX.Element> {
  let goals: Awaited<ReturnType<typeof goalsService.list>> = [];

  try {
    goals = await goalsService.list();
  } catch {
    // API unavailable
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Metas</h1>
        <Button asChild>
          <Link href="/metas/nova">
            <Plus className="h-4 w-4" />
            Nova Meta
          </Link>
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium">Nenhuma meta cadastrada</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie uma meta para acompanhar suas economias.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/metas/nova">Criar Meta</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => {
            const totalActual = goal.entries.reduce(
              (acc, e) => acc + Number(e.actualAmount ?? 0),
              0,
            );
            const target = Number(goal.targetAmount);
            const percentage = target > 0 ? Math.min((totalActual / target) * 100, 100) : 0;

            return (
              <Card key={goal.id} className="group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">
                      <Link href={`/metas/${goal.id}`} className="hover:underline">
                        {goal.name}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant={STATUS_VARIANTS[goal.status]}>
                        {STATUS_LABELS[goal.status]}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-100 transition-opacity shrink-0 md:opacity-0 md:group-hover:opacity-100"
                        asChild
                      >
                        <Link href={`/metas/${goal.id}/editar`}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </Button>
                      <DeleteItemButton id={goal.id} endpoint="/goals" label={goal.name} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex justify-between text-sm">
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

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(0)}% atingido</span>
                    {goal.targetDate && (
                      <span>
                        Meta: {new Date(goal.targetDate).toLocaleDateString('pt-BR', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  {goal.notes && (
                    <p className="text-xs text-muted-foreground">{goal.notes}</p>
                  )}

                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/metas/${goal.id}`}>
                      <Wallet className="h-4 w-4" />
                      Ver aportes
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
