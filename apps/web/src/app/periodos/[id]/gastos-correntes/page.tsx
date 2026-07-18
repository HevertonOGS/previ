import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';

import { CurrentExpensesBoard } from '../../../../components/features/current-expenses-board';
import { Button } from '../../../../components/ui/button';
import { currentExpensesService } from '../../../../services/current-expenses.service';

type Props = { params: Promise<{ id: string }> };

export default async function CurrentExpensesPage({ params }: Props): Promise<JSX.Element> {
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
