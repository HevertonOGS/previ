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
import type { Category, ExpenseType } from '../../../../../../lib/types';
import { generalExpensesService } from '../../../../../../services/general-expenses.service';
import { referenceService, type StatusOption, type PaymentMethodOption } from '../../../../../../services/reference.service';

export default function EditGeneralExpensePage(): JSX.Element {
  const router = useRouter();
  const { id: periodId, expenseId } = useParams<{ id: string; expenseId: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [sourceOptions, setSourceOptions] = useState<StatusOption[]>([]);

  const [form, setForm] = useState({
    name: '',
    expenseTypeId: '',
    categoryId: '',
    source: '',
    estimatedAmount: '',
    actualAmount: '',
    expectedPayAt: '',
    paidAt: '',
    status: '',
    paymentMethod: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      generalExpensesService.get(expenseId),
      referenceService.categories('EXPENSE'),
      referenceService.expenseTypes(),
      referenceService.expenseStatusOptions(),
      referenceService.paymentMethodOptions(),
      referenceService.sourceOptions(),
    ]).then(([expense, cats, types, statuses, payments, sources]) => {
      setCategories(cats);
      setExpenseTypes(types);
      setStatusOptions(statuses);
      setPaymentMethods(payments);
      setSourceOptions(sources);
      setForm({
        name: expense.name,
        expenseTypeId: expense.expenseTypeId,
        categoryId: expense.categoryId,
        source: expense.source ?? '',
        estimatedAmount: expense.estimatedAmount,
        actualAmount: expense.actualAmount ?? '',
        expectedPayAt: expense.expectedPayAt ? expense.expectedPayAt.slice(0, 10) : '',
        paidAt: expense.paidAt ? expense.paidAt.slice(0, 10) : '',
        status: expense.status,
        paymentMethod: expense.paymentMethod ?? '',
        notes: expense.notes ?? '',
      });
    }).catch(() => undefined).finally(() => setFetching(false));
  }, [expenseId]);

  function set(field: string, value: string): void {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    try {
      await generalExpensesService.update(expenseId, {
        name: form.name,
        expenseTypeId: form.expenseTypeId,
        categoryId: form.categoryId,
        source: form.source || null,
        estimatedAmount: form.estimatedAmount,
        actualAmount: form.actualAmount || null,
        expectedPayAt: form.expectedPayAt || null,
        paidAt: form.paidAt || null,
        status: form.status,
        paymentMethod: form.paymentMethod || null,
        notes: form.notes || null,
      });
      router.push(`/periodos/${periodId}/gastos-gerais`);
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
          <Link href={`/periodos/${periodId}/gastos-gerais`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Editar Gasto Geral</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Dados do gasto</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Descrição *</Label>
              <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="expenseTypeId">Tipo *</Label>
                <Select id="expenseTypeId" value={form.expenseTypeId} onChange={(e) => set('expenseTypeId', e.target.value)} required>
                  {expenseTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="categoryId">Categoria *</Label>
                <Select id="categoryId" value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} required>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="source">Fonte</Label>
              <Select id="source" value={form.source} onChange={(e) => set('source', e.target.value)}>
                <option value="">Não definido</option>
                {sourceOptions.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="estimatedAmount">Valor estimado (R$) *</Label>
                <Input id="estimatedAmount" type="number" step="0.01" min="0" value={form.estimatedAmount}
                  onChange={(e) => set('estimatedAmount', e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="actualAmount">Valor pago (R$)</Label>
                <Input id="actualAmount" type="number" step="0.01" min="0" value={form.actualAmount}
                  onChange={(e) => set('actualAmount', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="expectedPayAt">Vencimento</Label>
                <Input id="expectedPayAt" type="date" value={form.expectedPayAt}
                  onChange={(e) => set('expectedPayAt', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="paidAt">Pago em</Label>
                <Input id="paidAt" type="date" value={form.paidAt}
                  onChange={(e) => set('paidAt', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="status">Status</Label>
                <Select id="status" value={form.status} onChange={(e) => set('status', e.target.value)}>
                  {statusOptions.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="paymentMethod">Forma de pagamento</Label>
                <Select id="paymentMethod" value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
                  <option value="">Não definido</option>
                  {paymentMethods.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                </Select>
              </div>
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
