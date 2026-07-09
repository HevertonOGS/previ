import Link from 'next/link';
import { Plus } from 'lucide-react';
import { periodsService } from '../../services/periods.service';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default async function PeriodsPage() {
  let periods: Awaited<ReturnType<typeof periodsService.list>> = [];

  try {
    periods = await periodsService.list();
  } catch {
    // API unavailable
  }

  const now = new Date();

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Períodos</h1>
        <Button asChild>
          <Link href="/periodos/novo">
            <Plus className="h-4 w-4" />
            Novo Período
          </Link>
        </Button>
      </div>

      {periods.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum período cadastrado ainda.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {periods.map((period) => {
            const isCurrent =
              period.year === now.getFullYear() && period.month === now.getMonth() + 1;
            return (
              <Link key={period.id} href={`/periodos/${period.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between py-5 px-5">
                    <span className="font-semibold">
                      {MONTH_NAMES[period.month - 1]} {period.year}
                    </span>
                    {isCurrent ? (
                      <Badge variant="success">Atual</Badge>
                    ) : (
                      <Badge variant="secondary">Ver</Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
