'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil } from 'lucide-react';
import { goalsService } from '../../services/goals.service';
import type { GoalEntry } from '../../lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../ui/dialog';

const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

type Props =
  | { mode: 'create'; goalId: string; entry?: undefined }
  | { mode: 'edit'; goalId?: undefined; entry: GoalEntry };

export function GoalEntryFormDialog(props: Props) {
  const router = useRouter();
  const now = new Date();

  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(
    props.mode === 'edit' ? String(props.entry.month) : String(now.getMonth() + 1),
  );
  const [year, setYear] = useState(
    props.mode === 'edit' ? String(props.entry.year) : String(now.getFullYear()),
  );
  const [plannedAmount, setPlannedAmount] = useState(
    props.mode === 'edit' ? props.entry.plannedAmount : '',
  );
  const [actualAmount, setActualAmount] = useState(
    props.mode === 'edit' ? props.entry.actualAmount ?? '' : '',
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (props.mode === 'create') {
        await goalsService.createEntry({
          goalId: props.goalId,
          year: Number(year),
          month: Number(month),
          plannedAmount,
          actualAmount: actualAmount || null,
        });
      } else {
        await goalsService.updateEntry(props.entry.id, {
          plannedAmount,
          actualAmount: actualAmount || null,
        });
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar aporte.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {props.mode === 'create' ? (
        <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Adicionar mês
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.mode === 'create' ? 'Adicionar mês' : 'Editar aporte'}</DialogTitle>
          <DialogDescription>
            Defina quanto planeja guardar e, quando guardar de fato, registre o valor real.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="month">Mês</Label>
              {props.mode === 'create' ? (
                <Select id="month" value={month} onChange={(e) => setMonth(e.target.value)}>
                  {MONTH_LABELS.map((label, i) => (
                    <option key={label} value={i + 1}>{label}</option>
                  ))}
                </Select>
              ) : (
                <Input id="month" value={MONTH_LABELS[Number(month) - 1]} disabled />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="year">Ano</Label>
              {props.mode === 'create' ? (
                <Input
                  id="year"
                  type="number"
                  min="2020"
                  max="2100"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
              ) : (
                <Input id="year" value={year} disabled />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plannedAmount">Planejado (R$) *</Label>
              <Input
                id="plannedAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={plannedAmount}
                onChange={(e) => setPlannedAmount(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="actualAmount">Real (R$)</Label>
              <Input
                id="actualAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
