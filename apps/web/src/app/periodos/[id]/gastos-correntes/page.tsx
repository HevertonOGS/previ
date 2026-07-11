import Link from 'next/link';
import { ArrowLeft, Plus, Pencil } from 'lucide-react';
import { currentExpensesService } from '../../../../services/current-expenses.service';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { DeleteItemButton } from '../../../../components/features/delete-item-button';

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

const PAYMENT_LABELS: Record<string, string> = {
  DEBIT: 'Débito',
  CREDIT: 'Crédito',
  PIX: 'PIX',
  CASH: 'Dinheiro',
  BENEFITS: 'Benefícios',
  OTHER: 'Outro',
};

type Props = { params: Promise<{ id: string }> };

export default async function CurrentExpensesPage({ params }: Props) {
  const { id } = await params;
  let expenses: Awaited<ReturnType<typeof currentExpensesService.list>> = [];

  try {
    expenses = await currentExpensesService.list(id);
  } catch {
    // API unavailable
  }

  const total = expenses.reduce((acc, e) => acc + Number(e.amount), 0);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/periodos/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">Gastos Correntes</h1>
        </div>
        <Button asChild>
          <Link href={`/periodos/${id}/gastos-correntes/novo`}>
            <Plus className="h-4 w-4" />
            Novo Gasto
          </Link>
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="rounded-lg border bg-card px-5 py-3">
          <p className="text-xs text-muted-foreground">Total gasto</p>
          <p className="text-xl font-bold text-red-500">{formatCurrency(total)}</p>
        </div>
        <div className="rounded-lg border bg-card px-5 py-3">
          <p className="text-xs text-muted-foreground">Lançamentos</p>
          <p className="text-xl font-bold">{expenses.length}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum gasto corrente lançado.</p>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} className="group">
              <CardContent className="flex items-center justify-between py-4 px-5">
                <div>
                  <p className="font-medium">{expense.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(expense.paidAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                  <Badge variant="secondary">
                    {PAYMENT_LABELS[expense.paymentMethod] ?? expense.paymentMethod}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" asChild>
                    <Link href={`/periodos/${id}/gastos-correntes/${expense.id}/editar`}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </Button>
                  <DeleteItemButton id={expense.id} endpoint="/current-expenses" label={expense.name} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
