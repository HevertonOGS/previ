import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { currentExpensesService } from '../../../../services/current-expenses.service';
import { Button } from '../../../../components/ui/button';
import { CurrentExpensesBoard } from '../../../../components/features/current-expenses-board';

type Props = { params: Promise<{ id: string }> };

export default async function CurrentExpensesPage({ params }: Props) {
  const { id } = await params;
  let expenses: Awaited<ReturnType<typeof currentExpensesService.list>> = [];

  try {
    expenses = await currentExpensesService.list(id);
  } catch {
    // API unavailable
  }

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

      <CurrentExpensesBoard periodId={id} expenses={expenses} />
    </div>
  );
}
