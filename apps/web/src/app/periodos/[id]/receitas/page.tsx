import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { incomesService } from '../../../../services/incomes.service';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  RECEIVED: 'Recebida',
};

type Props = { params: Promise<{ id: string }> };

export default async function IncomesPage({ params }: Props) {
  const { id } = await params;
  let incomes: Awaited<ReturnType<typeof incomesService.list>> = [];

  try {
    incomes = await incomesService.list(id);
  } catch {
    // API unavailable
  }

  const totalReceived = incomes
    .filter((i) => i.status === 'RECEIVED')
    .reduce((acc, i) => acc + Number(i.actualAmount ?? i.expectedAmount), 0);

  const totalExpected = incomes.reduce((acc, i) => acc + Number(i.expectedAmount), 0);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/periodos/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Receitas</h1>
      </div>

      <div className="flex gap-4">
        <div className="rounded-lg border bg-card px-5 py-3">
          <p className="text-xs text-muted-foreground">Previsto</p>
          <p className="text-xl font-bold">{formatCurrency(totalExpected)}</p>
        </div>
        <div className="rounded-lg border bg-card px-5 py-3">
          <p className="text-xs text-muted-foreground">Recebido</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalReceived)}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button asChild>
          <Link href={`/periodos/${id}/receitas/nova`}>
            <Plus className="h-4 w-4" />
            Nova Receita
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {incomes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma receita lançada.</p>
        ) : (
          incomes.map((income) => (
            <Card key={income.id}>
              <CardContent className="flex items-center justify-between py-4 px-5">
                <div>
                  <p className="font-medium">{income.name}</p>
                  <p className="text-xs text-muted-foreground">{income.category}</p>
                </div>
                <div className="flex items-center gap-3">
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
                  <Badge variant={income.status === 'RECEIVED' ? 'success' : 'warning'}>
                    {STATUS_LABELS[income.status]}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
