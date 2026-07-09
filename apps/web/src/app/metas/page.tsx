import Link from 'next/link';
import { Plus, Target } from 'lucide-react';
import { goalsService } from '../../services/goals.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

function formatCurrency(value: string | number) {
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

export default async function GoalsPage() {
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
              <Card key={goal.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{goal.name}</CardTitle>
                    <Badge variant={STATUS_VARIANTS[goal.status]}>
                      {STATUS_LABELS[goal.status]}
                    </Badge>
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
                    <p className="text-xs text-muted-foreground border-t pt-2">{goal.notes}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
