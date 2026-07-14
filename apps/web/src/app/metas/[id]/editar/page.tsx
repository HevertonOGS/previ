'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { goalsService } from '../../../../services/goals.service';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

export default function EditGoalPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    status: 'ACTIVE' as 'ACTIVE' | 'COMPLETED' | 'PAUSED',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    goalsService.get(id)
      .then((goal) => {
        setForm({
          name: goal.name,
          targetAmount: goal.targetAmount,
          targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : '',
          status: goal.status,
          notes: goal.notes ?? '',
        });
      })
      .catch(() => undefined)
      .finally(() => setFetching(false));
  }, [id]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await goalsService.update(id, {
        name: form.name,
        targetAmount: form.targetAmount,
        targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : null,
        status: form.status,
        notes: form.notes || null,
      });
      router.push('/metas');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar meta.');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="p-8 text-sm text-muted-foreground">Carregando...</div>;

  return (
    <div className="flex flex-col gap-6 p-8 max-w-lg">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/metas"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Editar Meta</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Dados da meta</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nome da meta *</Label>
              <Input
                id="name"
                placeholder="Ex: Reserva de emergência"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="targetAmount">Valor alvo (R$) *</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={form.targetAmount}
                  onChange={(e) => set('targetAmount', e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="targetDate">Data alvo</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => set('targetDate', e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                <option value="ACTIVE">Ativa</option>
                <option value="PAUSED">Pausada</option>
                <option value="COMPLETED">Concluída</option>
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
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
