import { CalendarDays, TrendingUp, ShoppingCart, Target } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { periodsService } from '../services/periods.service';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default async function DashboardPage(): Promise<JSX.Element> {
  let periods: Awaited<ReturnType<typeof periodsService.list>> = [];

  try {
    periods = await periodsService.list();
  } catch {
    // API unavailable at build time
  }

  const now = new Date();
  const currentPeriod = periods.find(
    (p) => p.year === now.getFullYear() && p.month === now.getMonth() + 1,
  );
  const recentPeriods = periods.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {MONTH_NAMES[now.getMonth()]} de {now.getFullYear()}
          </p>
        </div>
        <Button asChild>
          <Link href="/periodos/novo">Novo Período</Link>
        </Button>
      </div>

      {currentPeriod ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Período Atual
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {MONTH_NAMES[currentPeriod.month - 1]} {currentPeriod.year}
              </p>
              <Badge variant="success" className="mt-1">Ativo</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receitas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground">
                <Link href={`/periodos/${currentPeriod.id}`} className="hover:underline">
                  Ver período
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gastos
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground">
                <Link href={`/periodos/${currentPeriod.id}`} className="hover:underline">
                  Ver período
                </Link>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Metas Ativas
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground">
                <Link href="/metas" className="hover:underline">Ver metas</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium">Nenhum período ativo para este mês</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie um período para começar a registrar.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/periodos/novo">Criar Período</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Períodos Recentes</h2>
        {recentPeriods.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum período encontrado.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentPeriods.map((period) => (
              <Link key={period.id} href={`/periodos/${period.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4 px-5">
                    <span className="font-medium">
                      {MONTH_NAMES[period.month - 1]} {period.year}
                    </span>
                    <Badge variant="secondary">Ver</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
