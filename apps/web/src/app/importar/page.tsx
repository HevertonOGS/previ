'use client';

import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import type { Period, Category, ExpenseType } from '../../lib/types';
import { importService, type ParsedTransaction } from '../../services/import.service';
import { periodsService } from '../../services/periods.service';
import { referenceService } from '../../services/reference.service';

const PAYMENT_METHODS = [
  { value: 'DEBIT', label: 'Débito' },
  { value: 'CREDIT', label: 'Crédito' },
  { value: 'PIX', label: 'PIX' },
  { value: 'CASH', label: 'Dinheiro' },
  { value: 'BENEFITS', label: 'Benefícios' },
  { value: 'OTHER', label: 'Outro' },
];

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

type Step = 'upload' | 'preview' | 'success';

export default function ImportPage(): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [importedCount, setImportedCount] = useState(0);

  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [editedRows, setEditedRows] = useState<Record<string, Partial<ParsedTransaction>>>({});
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const [periods, setPeriods] = useState<Period[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);

  const [periodId, setPeriodId] = useState('');
  const [expenseTypeId, setExpenseTypeId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('DEBIT');

  useEffect(() => {
    Promise.all([
      periodsService.list(),
      referenceService.categories(),
      referenceService.expenseTypes(),
    ]).then(([p, c, t]) => {
      setPeriods(p);
      setCategories(c);
      setExpenseTypes(t);
      if (p.length > 0) setPeriodId(p[0].id);
      if (c.length > 0) setCategoryId(c[0].id);
      if (t.length > 0) setExpenseTypeId(t[0].id);
    }).catch(() => undefined);
  }, []);

  async function handleFile(file: File): Promise<void> {
    setError('');
    setUploading(true);
    try {
      const parsed = await importService.parseStatement(file);
      setTransactions(parsed);
      setEditedRows({});
      setRemovedIds(new Set());
      setStep('preview');
    } catch {
      // erro já exibido via toast
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent): void {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  function removeRow(tempId: string): void {
    setRemovedIds((prev) => new Set([...prev, tempId]));
  }

  function restoreRow(tempId: string): void {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.delete(tempId);
      return next;
    });
  }

  function editRow(tempId: string, field: keyof ParsedTransaction, value: string | number): void {
    setEditedRows((prev) => ({
      ...prev,
      [tempId]: { ...prev[tempId], [field]: value },
    }));
  }

  function getRow(t: ParsedTransaction): ParsedTransaction {
    return { ...t, ...(editedRows[t.tempId] ?? {}) };
  }

  const activeTransactions = transactions.filter((t) => !removedIds.has(t.tempId));

  async function handleConfirm(): Promise<void> {
    if (!periodId || !expenseTypeId || !categoryId) {
      setError('Selecione período, tipo e categoria.');
      return;
    }
    setError('');
    setConfirming(true);
    try {
      const result = await importService.confirmImport({
        periodId,
        expenseTypeId,
        categoryId,
        paymentMethod,
        transactions: activeTransactions.map(getRow),
      });
      setImportedCount(result.created);
      setStep('success');
    } catch {
      // erro já exibido via toast
    } finally {
      setConfirming(false);
    }
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[50vh]">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold">Importação concluída!</h1>
        <p className="text-muted-foreground">
          {importedCount} transaç{importedCount === 1 ? 'ão importada' : 'ões importadas'} com sucesso.
        </p>
        <div className="flex gap-3 mt-2">
          <Button onClick={() => setStep('upload')}>Importar outro arquivo</Button>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="flex flex-col gap-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Revisar Importação</h1>
            <p className="text-sm text-muted-foreground">
              {transactions.length} transações encontradas · {removedIds.size} removidas ·{' '}
              <span className="font-medium">{activeTransactions.length} serão importadas</span>
            </p>
          </div>
          <Button variant="outline" onClick={() => setStep('upload')}>
            Carregar outro arquivo
          </Button>
        </div>

        {/* Settings */}
        <Card>
          <CardHeader><CardTitle className="text-base">Configurações da importação</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <Label>Período *</Label>
                <Select value={periodId} onChange={(e) => setPeriodId(e.target.value)}>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {MONTH_NAMES[p.month - 1]} {p.year}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Tipo de gasto *</Label>
                <Select value={expenseTypeId} onChange={(e) => setExpenseTypeId(e.target.value)}>
                  {expenseTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Categoria *</Label>
                <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Forma de pagamento</Label>
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction table */}
        <div className="flex flex-col gap-2">
          {transactions.map((t) => {
            const row = getRow(t);
            const removed = removedIds.has(t.tempId);
            return (
              <Card key={t.tempId} className={removed ? 'opacity-40' : ''}>
                <CardContent className="flex items-center gap-4 py-3 px-4">
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <Input
                      value={row.description}
                      onChange={(e) => editRow(t.tempId, 'description', e.target.value)}
                      disabled={removed}
                      className="h-7 text-sm"
                    />
                    <Input
                      type="date"
                      value={row.date}
                      onChange={(e) => editRow(t.tempId, 'date', e.target.value)}
                      disabled={removed}
                      className="h-7 text-sm w-36"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Input
                      type="number"
                      step="0.01"
                      value={row.amount}
                      onChange={(e) => editRow(t.tempId, 'amount', parseFloat(e.target.value))}
                      disabled={removed}
                      className="h-7 text-sm w-28 text-right"
                    />
                    {removed ? (
                      <Button size="sm" variant="ghost" onClick={() => restoreRow(t.tempId)}>
                        Restaurar
                      </Button>
                    ) : (
                      <Button size="icon" variant="ghost" onClick={() => removeRow(t.tempId)}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setStep('upload')}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={confirming || activeTransactions.length === 0}>
            {confirming ? 'Importando...' : `Importar ${activeTransactions.length} transações`}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Importar Extrato</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Carregue um arquivo OFX ou CSV exportado do seu banco.
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="font-medium">Arraste um arquivo aqui ou clique para selecionar</p>
        <p className="text-sm text-muted-foreground mt-1">Suporta OFX e CSV</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ofx,.csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
        />
      </div>

      {uploading && <p className="text-sm text-muted-foreground text-center">Processando arquivo...</p>}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm">Formatos suportados</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">OFX</Badge>
            <span>Extrato bancário padrão (Nubank, Itaú, Bradesco, etc.)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">CSV</Badge>
            <span>Planilha exportada do app do banco ou fatura do cartão</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
