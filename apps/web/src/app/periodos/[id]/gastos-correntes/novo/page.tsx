'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { currentExpensesService } from '../../../../../services/current-expenses.service';
import { referenceService } from '../../../../../services/reference.service';
import type { Category, ExpenseType } from '../../../../../lib/types';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Select } from '../../../../../components/ui/select';
import { Textarea } from '../../../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';

const PAYMENT_METHODS = [
  { value: 'DEBIT', label: 'Débito' },
  { value: 'CREDIT', label: 'Crédito' },
  { value: 'PIX', label: 'PIX' },
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'BENEFITS', label: 'Benefícios' },
  { value: 'OTHER', label: 'Outro' },
];

const today = new Date().toISOString().split('T')[0];

export default function NewCurrentExpensePage() {
  const router = useRouter();
  const { id: periodId } = useParams<{ id: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);

  const [form, setForm] = useState({
    name: '',
    expenseTypeId: '',
    categoryId: '',
    amount: '',
    paidAt: today,
    paymentMethod: 'PIX',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([referenceService.categories(), referenceService.expenseTypes()])
      .then(([cats, types]) => {
        setCategories(cats);
        setExpenseTypes(types);
        setForm((prev) => ({
          ...prev,
          categoryId: cats[0]?.id ?? '',
          expenseTypeId: types[0]?.id ?? '',
        }));
      })
      .catch(() => {});
  }, []);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await currentExpensesService.create({
        periodId,
        name: form.name,
        expenseTypeId: form.expenseTypeId,
        categoryId: form.categoryId,
        amount: form.amount,
        paidAt: new Date(form.paidAt).toISOString(),
        paymentMethod: form.paymentMethod as never,
        notes: form.notes || null,
      });
      router.push(`/periodos/${periodId}/gastos-correntes`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar gasto.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-lg">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/periodos/${periodId}/gastos-correntes`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Novo Gasto Corrente</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Dados do gasto</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Descrição *</Label>
              <Input
                id="name"
                placeholder="Ex: Mercado, iFood, etc."
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="expenseTypeId">Tipo *</Label>
                <Select
                  id="expenseTypeId"
                  value={form.expenseTypeId}
                  onChange={(e) => set('expenseTypeId', e.target.value)}
                  required
                >
                  {expenseTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="categoryId">Categoria *</Label>
                <Select
                  id="categoryId"
                  value={form.categoryId}
                  onChange={(e) => set('categoryId', e.target.value)}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="amount">Valor (R$) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={form.amount}
                  onChange={(e) => set('amount', e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="paidAt">Data *</Label>
                <Input
                  id="paidAt"
                  type="date"
                  value={form.paidAt}
                  onChange={(e) => set('paidAt', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="paymentMethod">Forma de pagamento *</Label>
              <Select
                id="paymentMethod"
                value={form.paymentMethod}
                onChange={(e) => set('paymentMethod', e.target.value)}
                required
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Opcional"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Salvando...' : 'Salvar Gasto'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
