import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';

import { GeneralExpensesBoard } from '../../../../components/features/general-expenses-board';
import { Button } from '../../../../components/ui/button';
import { generalExpensesService } from '../../../../services/general-expenses.service';
import { referenceService } from '../../../../services/reference.service';

type Props = { params: Promise<{ id: string }> };

export default async function GeneralExpensesPage({ params }: Props): Promise<JSX.Element> {
  const { id } = await params;
  let expenses: Awaited<ReturnType<typeof generalExpensesService.list>> = [];
  let statusOptions: Awaited<ReturnType<typeof referenceService.expenseStatusOptions>> = [];

  try {
    expenses = await generalExpensesService.list(id);
  } catch {
    // API unavailable
  }

  try {
    statusOptions = await referenceService.expenseStatusOptions();
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
          <h1 className="text-2xl font-bold">Gastos Gerais</h1>
        </div>
        <Button asChild>
          <Link href={`/periodos/${id}/gastos-gerais/novo`}>
            <Plus className="h-4 w-4" />
            Novo Gasto Geral
          </Link>
        </Button>
      </div>

      <GeneralExpensesBoard periodId={id} expenses={expenses} statusOptions={statusOptions} />
    </div>
  );
}
