'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { periodsService } from '../../services/periods.service';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '../ui/dialog';

interface DeletePeriodButtonProps {
  periodId: string;
  periodLabel: string;
}

export function DeletePeriodButton({ periodId, periodLabel }: DeletePeriodButtonProps): JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete(): Promise<void> {
    setLoading(true);
    try {
      await periodsService.delete(periodId);
      setOpen(false);
      router.push('/periodos');
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir período</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir <strong>{periodLabel}</strong>?
            <br />
            Todos os dados associados — receitas, gastos e balanços — serão removidos permanentemente.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
