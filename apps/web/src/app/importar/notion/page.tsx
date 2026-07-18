'use client';

import { Upload, CheckCircle, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import type { Period, Goal } from '../../../lib/types';
import { goalsService } from '../../../services/goals.service';
import {
  notionImportService,
  type NotionTableType,
  type ParsedNotionIncome,
  type ParsedNotionGeneralExpense,
  type ParsedNotionCurrentExpense,
  type ParsedNotionGoalEntry,
  type ParsedNotionRow,
} from '../../../services/notion-import.service';
import { periodsService } from '../../../services/periods.service';

const TABLE_OPTIONS: { value: NotionTableType; label: string; description: string }[] = [
  { value: 'incomes', label: 'Receitas', description: 'Tabela de receitas do mês' },
  { value: 'general-expenses', label: 'Gastos Gerais', description: 'Gastos previsíveis do mês' },
  { value: 'current-expenses', label: 'Gastos Correntes', description: 'Gastos do dia a dia' },
  { value: 'goals', label: 'Metas', description: 'Entradas mensais de metas de poupança' },
];

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

function formatCurrency(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

type Step = 'select-type' | 'upload' | 'preview' | 'success';

export default function NotionImportPage(): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('select-type');
  const [tableType, setTableType] = useState<NotionTableType>('incomes');
  const [rows, setRows] = useState<ParsedNotionRow[]>([]);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  const [periods, setPeriods] = useState<Period[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [periodId, setPeriodId] = useState('');
  const [goalId, setGoalId] = useState('');

  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  useEffect(() => {
    periodsService.list().then((p) => { setPeriods(p); if (p.length) setPeriodId(p[0].id); }).catch(() => undefined);
    goalsService.list().then((g) => { setGoals(g); if (g.length) setGoalId(g[0].id); }).catch(() => undefined);
  }, []);

  async function handleFile(file: File): Promise<void> {
    setUploading(true);
    try {
      const parsed = await notionImportService.parseFile(file, tableType);
      setRows(parsed);
      setRemovedIds(new Set());
      setStep('preview');
    } catch {
      // erro já exibido via toast
    } finally { setUploading(false); }
  }

  const activeRows = rows.filter((r) => !removedIds.has(r.tempId));

  async function handleConfirm(): Promise<void> {
    setConfirming(true);
    try {
      let result: { created: number };
      if (tableType === 'incomes') {
        result = await notionImportService.confirmIncomes(periodId, activeRows as ParsedNotionIncome[]);
      } else if (tableType === 'general-expenses') {
        result = await notionImportService.confirmGeneralExpenses(periodId, activeRows as ParsedNotionGeneralExpense[]);
      } else if (tableType === 'current-expenses') {
        result = await notionImportService.confirmCurrentExpenses(periodId, activeRows as ParsedNotionCurrentExpense[]);
      } else {
        result = await notionImportService.confirmGoals(goalId, activeRows as ParsedNotionGoalEntry[]);
      }
      setImportedCount(result.created);
      setStep('success');
    } catch {
      // erro já exibido via toast
    } finally { setConfirming(false); }
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[50vh]">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold">Importação concluída!</h1>
        <p className="text-muted-foreground">{importedCount} registro(s) importado(s) com sucesso.</p>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={() => { setStep('select-type'); setRows([]); }}>
            Importar outra tabela
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="flex flex-col gap-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Revisar Importação — {TABLE_OPTIONS.find(t => t.value === tableType)?.label}</h1>
            <p className="text-sm text-muted-foreground">
              {rows.length} registros encontrados · {removedIds.size} removidos ·{' '}
              <span className="font-medium">{activeRows.length} serão importados</span>
            </p>
          </div>
          <Button variant="outline" onClick={() => setStep('upload')}>Outro arquivo</Button>
        </div>

        {/* Target selection */}
        <Card>
          <CardHeader><CardTitle className="text-base">Destino</CardTitle></CardHeader>
          <CardContent>
            {tableType !== 'goals' ? (
              <div className="flex flex-col gap-1.5 max-w-xs">
                <Label>Período</Label>
                <Select value={periodId} onChange={(e) => setPeriodId(e.target.value)}>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>{MONTH_NAMES[p.month - 1]} {p.year}</option>
                  ))}
                </Select>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-w-xs">
                <Label>Meta</Label>
                <Select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
                  {goals.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview table */}
        <div className="flex flex-col gap-2">
          {rows.map((row) => {
            const removed = removedIds.has(row.tempId);
            return (
              <Card key={row.tempId} className={removed ? 'opacity-40' : ''}>
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <div className="flex-1 min-w-0">
                    <PreviewRow type={tableType} row={row} />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRemovedIds((prev) => {
                      const next = new Set(prev);
                      if (removed) next.delete(row.tempId); else next.add(row.tempId);
                      return next;
                    })}
                  >
                    {removed ? 'Restaurar' : <X className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setStep('select-type')}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={confirming || activeRows.length === 0}>
            {confirming ? 'Importando...' : `Importar ${activeRows.length} registros`}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'upload') {
    return (
      <div className="flex flex-col gap-6 p-8 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">
            Importar do Notion — {TABLE_OPTIONS.find(t => t.value === tableType)?.label}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Exporte a tabela como CSV no Notion e faça o upload aqui.
          </p>
        </div>

        <div
          className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">Clique ou arraste o CSV exportado do Notion</p>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
        </div>

        {uploading && <p className="text-sm text-center text-muted-foreground">Processando...</p>}

        <Button variant="outline" onClick={() => setStep('select-type')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Importar do Notion</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione qual tabela do Notion deseja importar.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TABLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setTableType(opt.value); setStep('upload'); }}
            className="text-left rounded-xl border p-5 hover:border-primary/50 hover:bg-accent/30 transition-colors"
          >
            <p className="font-semibold">{opt.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{opt.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewRow({ type, row }: { type: NotionTableType; row: ParsedNotionRow }): JSX.Element {
  if (type === 'incomes') {
    const r = row as ParsedNotionIncome;
    return (
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.category}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold">{formatCurrency(r.expectedAmount)}</p>
          <Badge variant={r.status === 'RECEIVED' ? 'success' : 'warning'}>
            {r.status === 'RECEIVED' ? 'Recebida' : 'Pendente'}
          </Badge>
        </div>
      </div>
    );
  }
  if (type === 'general-expenses') {
    const r = row as ParsedNotionGeneralExpense;
    return (
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.expenseTypeName} · {r.categoryName}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold">{formatCurrency(r.estimatedAmount)}</p>
          {r.actualAmount !== null && <p className="text-xs text-muted-foreground">Pago: {formatCurrency(r.actualAmount)}</p>}
        </div>
      </div>
    );
  }
  if (type === 'current-expenses') {
    const r = row as ParsedNotionCurrentExpense;
    return (
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.paidAt} · {r.categoryName}</p>
        </div>
        <p className="font-semibold shrink-0">{formatCurrency(r.amount)}</p>
      </div>
    );
  }
  const r = row as ParsedNotionGoalEntry;
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="font-medium">{MONTH_NAMES[r.month - 1]} {r.year}</p>
      <div className="text-right shrink-0">
        <p className="text-sm">Previsto: {formatCurrency(r.plannedAmount)}</p>
        {r.actualAmount !== null && <p className="text-xs text-muted-foreground">Real: {formatCurrency(r.actualAmount)}</p>}
      </div>
    </div>
  );
}
