'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, type JSX } from 'react';

import { Button } from '../../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Input } from '../../../../../../components/ui/input';
import { Label } from '../../../../../../components/ui/label';
import { Select } from '../../../../../../components/ui/select';
import { Textarea } from '../../../../../../components/ui/textarea';
import type { Category } from '../../../../../../lib/types';
import { incomesService } from '../../../../../../services/incomes.service';
import { referenceService, type StatusOption } from '../../../../../../services/reference.service';

export default function EditIncomePage(): JSX.Element {
  const router = useRouter();
  const { id: periodId, incomeId } = useParams<{ id: string; incomeId: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [sourceOptions, setSourceOptions] = useState<StatusOption[]>([]);
  const [form, setForm] = useState({
    name: '',
    category: '',
    source: '',
    expectedAmount: '',
    actualAmount: '',
    expectedReceiptAt: '',
    receivedAt: '',
    status: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      incomesService.get(incomeId),
      referenceService.categories('INCOME'),
      referenceService.incomeStatusOptions(),
      referenceService.sourceOptions(),
    ]).then(([income, cats, statuses, sources]) => {
      setCategories(cats);
      setStatusOptions(statuses);
      setSourceOptions(sources);
      setForm({
        name: income.name,
        category: income.category,
        source: income.source ?? '',
        expectedAmount: income.expectedAmount,
        actualAmount: income.actualAmount ?? '',
        expectedReceiptAt: income.expectedReceiptAt ? income.expectedReceiptAt.slice(0, 10) : '',
        receivedAt: income.receivedAt ? income.receivedAt.slice(0, 10) : '',
        status: income.status,
        notes: income.notes ?? '',
      });
    }).catch(() => undefined).finally(() => setFetching(false));
  }, [incomeId]);

  function set(field: string, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    try {
      await incomesService.update(incomeId, {
        name: form.name,
        category: form.category,
        source: form.source || null,
        expectedAmount: form.expectedAmount,
        actualAmount: form.actualAmount || null,
        expectedReceiptAt: form.expectedReceiptAt || null,
        receivedAt: form.receivedAt || null,
        status: form.status,
        notes: form.notes || null,
      });
      router.push(`/periodos/${periodId}/receitas`);
    } catch {
      // erro já exibido via toast
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="p-8 text-sm text-muted-foreground">Carregando...</div>;

  return (
    <div className="flex flex-col gap-6 p-8 max-w-lg">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/periodos/${periodId}/receitas`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Editar Receita</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Dados da receita</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Descrição *</Label>
              <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category">Categoria *</Label>
                <Select id="category" value={form.category} onChange={(e) => set('category', e.target.value)} required>
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="source">Fonte</Label>
                <Select id="source" value={form.source} onChange={(e) => set('source', e.target.value)}>
                  <option value="">Não definido</option>
                  {sourceOptions.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="expectedAmount">Valor previsto (R$) *</Label>
                <Input id="expectedAmount" type="number" step="0.01" min="0" value={form.expectedAmount}
                  onChange={(e) => set('expectedAmount', e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="actualAmount">Valor recebido (R$)</Label>
                <Input id="actualAmount" type="number" step="0.01" min="0" value={form.actualAmount}
                  onChange={(e) => set('actualAmount', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="expectedReceiptAt">Previsão de recebimento</Label>
                <Input id="expectedReceiptAt" type="date" value={form.expectedReceiptAt}
                  onChange={(e) => set('expectedReceiptAt', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="receivedAt">Recebido em</Label>
                <Input id="receivedAt" type="date" value={form.receivedAt}
                  onChange={(e) => set('receivedAt', e.target.value)} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {statusOptions.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
