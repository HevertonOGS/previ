import Link from 'next/link';
import { ArrowLeft, Plus, Pencil } from 'lucide-react';
import { generalExpensesService } from '../../../../services/general-expenses.service';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { DeleteItemButton } from '../../../../components/features/delete-item-button';

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

function expenseStatusVariant(status: string): 'success' | 'warning' | 'secondary' {
  const s = status.toLowerCase();
  if (s.includes('pago') || s.includes('paga')) return 'success';
  if (s.includes('pend')) return 'warning';
  return 'secondary';
}

type Props = { params: Promise<{ id: string }> };

export default async function GeneralExpensesPage({ params }: Props) {
  const { id } = await params;
  let expenses: Awaited<ReturnType<typeof generalExpensesService.list>> = [];

  try {
    expenses = await generalExpensesService.list(id);
  } catch {
    // API unavailable
  }

  const totalPaid = expenses
    .filter((e) => e.status === 'PAID')
    .reduce((acc, e) => acc + Number(e.actualAmount ?? e.estimatedAmount), 0);

  const totalEstimated = expenses.reduce((acc, e) => acc + Number(e.estimatedAmount), 0);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/periodos/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">Gastos Gerais</h1>
        </div>
        <Button asChild>
          <Link href={`/periodos/${id}/gastos-gerais/novo`}>
            <Plus className="h-4 w-4" />
            Novo Gasto Geral
          </Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="rounded-lg border bg-card px-5 py-3">
          <p className="text-xs text-muted-foreground">Estimado</p>
          <p className="text-xl font-bold">{formatCurrency(totalEstimated)}</p>
        </div>
        <div className="rounded-lg border bg-card px-5 py-3">
          <p className="text-xs text-muted-foreground">Pago</p>
          <p className="text-xl font-bold text-red-500">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum gasto geral lançado.</p>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} className="group">
              <CardContent className="flex items-center justify-between py-4 px-5">
                <div>
                  <p className="font-medium">{expense.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {expense.paidAt
                      ? `Pago em ${new Date(expense.paidAt).toLocaleDateString('pt-BR')}`
                      : expense.expectedPayAt
                      ? `Vence em ${new Date(expense.expectedPayAt).toLocaleDateString('pt-BR')}`
                      : 'Sem data'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                  <Badge variant={expenseStatusVariant(expense.status)}>
                    {expense.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" asChild>
                    <Link href={`/periodos/${id}/gastos-gerais/${expense.id}/editar`}>
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
