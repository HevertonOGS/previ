import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';

import { IncomesBoard } from '../../../../components/features/incomes-board';
import { Button } from '../../../../components/ui/button';
import { incomesService } from '../../../../services/incomes.service';
import { referenceService } from '../../../../services/reference.service';

type Props = { params: Promise<{ id: string }> };

export default async function IncomesPage({ params }: Props): Promise<JSX.Element> {
  const { id } = await params;
  let incomes: Awaited<ReturnType<typeof incomesService.list>> = [];
  let statusOptions: Awaited<ReturnType<typeof referenceService.incomeStatusOptions>> = [];

  try {
    incomes = await incomesService.list(id);
  } catch {
    // API unavailable
  }

  try {
    statusOptions = await referenceService.incomeStatusOptions();
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
          <h1 className="text-2xl font-bold">Receitas</h1>
        </div>
        <Button asChild>
          <Link href={`/periodos/${id}/receitas/nova`}>
            <Plus className="h-4 w-4" />
            Nova Receita
          </Link>
        </Button>
      </div>

      <IncomesBoard periodId={id} incomes={incomes} statusOptions={statusOptions} />
    </div>
  );
}
