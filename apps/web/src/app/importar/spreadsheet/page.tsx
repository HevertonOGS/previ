'use client';

import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect, type JSX } from 'react';

import { IMPORT_FIELD_DEFS, type ImportEntityType, type ImportFieldKind } from 'shared-types';

import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Select } from '../../../components/ui/select';
import type { Period, Goal, Category, ExpenseType } from '../../../lib/types';
import { goalsImportService, type ParsedGoalEntry } from '../../../services/goals-import.service';
import { goalsService } from '../../../services/goals.service';
import { periodsService } from '../../../services/periods.service';
import { referenceService, type PaymentMethodOption, type StatusOption, type StatusOptionWithColor } from '../../../services/reference.service';
import {
  spreadsheetImportService,
  type SpreadsheetParseResult,
  type SpreadsheetRow,
} from '../../../services/spreadsheet-import.service';

import { ColumnMapping } from './column-mapping';
import { LookupSummary } from './lookup-summary';
import { RowReviewCard } from './row-review-card';

type EntityChoice = ImportEntityType | 'goals';

const TABLE_OPTIONS: { value: EntityChoice; label: string; description: string }[] = [
  { value: 'income', label: 'Receitas', description: 'Receitas do mês' },
  { value: 'general-expense', label: 'Gastos Gerais', description: 'Gastos previsíveis do mês' },
  { value: 'current-expense', label: 'Gastos Correntes', description: 'Gastos do dia a dia' },
  { value: 'goals', label: 'Metas', description: 'Entradas mensais de metas de poupança' },
];

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

function formatCurrency(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

type Step = 'select-target' | 'upload' | 'mapping' | 'review' | 'success';

export default function SpreadsheetImportPage(): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('select-target');
  const [entityType, setEntityType] = useState<EntityChoice>('current-expense');

  const [periods, setPeriods] = useState<Period[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [periodId, setPeriodId] = useState('');
  const [goalId, setGoalId] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<PaymentMethodOption[]>([]);
  const [incomeStatusOptions, setIncomeStatusOptions] = useState<StatusOptionWithColor[]>([]);
  const [expenseStatusOptions, setExpenseStatusOptions] = useState<StatusOptionWithColor[]>([]);
  const [sourceOptions, setSourceOptions] = useState<StatusOption[]>([]);

  const [parseResult, setParseResult] = useState<SpreadsheetParseResult | null>(null);
  const [mapping, setMapping] = useState<Record<string, string | null>>({});
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [editedRaw, setEditedRaw] = useState<Record<string, Record<string, string>>>({});
  const [fieldOverrides, setFieldOverrides] = useState<Record<string, Record<string, string>>>({});

  const [goalRows, setGoalRows] = useState<ParsedGoalEntry[]>([]);
  const [goalRemovedIds, setGoalRemovedIds] = useState<Set<string>>(new Set());

  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [importedCount, setImportedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [serverMissingFields, setServerMissingFields] = useState<Record<string, string[]>>({});

  useEffect(() => {
    Promise.all([
      periodsService.list(),
      goalsService.list(),
      referenceService.categories(),
      referenceService.expenseTypes(),
      referenceService.paymentMethodOptions(),
      referenceService.incomeStatusOptions(),
      referenceService.expenseStatusOptions(),
      referenceService.sourceOptions(),
    ]).then(([p, g, c, t, pm, is, es, src]) => {
      setPeriods(p);
      setGoals(g);
      setCategories(c);
      setExpenseTypes(t);
      setPaymentMethodOptions(pm);
      setIncomeStatusOptions(is);
      setExpenseStatusOptions(es);
      setSourceOptions(src);
      if (p.length > 0) setPeriodId(p[0].id);
      if (g.length > 0) setGoalId(g[0].id);
    }).catch(() => undefined);
  }, []);

  const existingNamesByKind: Partial<Record<ImportFieldKind, string[]>> = {
    'lookup-expense-type': expenseTypes.map((t) => t.name),
    'lookup-category': categories.map((c) => c.name),
    'lookup-payment-method': paymentMethodOptions.map((p) => p.name),
    'lookup-status-income': incomeStatusOptions.map((s) => s.name),
    'lookup-status-expense': expenseStatusOptions.map((s) => s.name),
    'lookup-source': sourceOptions.map((s) => s.name),
  };

  const fields = entityType !== 'goals' ? IMPORT_FIELD_DEFS[entityType] : [];
  const missingRequiredFields = fields.filter((f) => f.required && !mapping[f.key]);

  async function handleFile(file: File): Promise<void> {
    setError('');
    setUploading(true);
    try {
      if (entityType === 'goals') {
        const rows = await goalsImportService.parseFile(file);
        setGoalRows(rows);
        setGoalRemovedIds(new Set());
        setStep('review');
      } else {
        const result = await spreadsheetImportService.parseFile(file, entityType);
        setParseResult(result);
        setMapping(result.suggestedMapping);
        setRemovedIds(new Set());
        setStep('mapping');
      }
    } catch {
      // erro já exibido via toast
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent): void {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  function getEffectiveRow(row: SpreadsheetRow): SpreadsheetRow {
    const overrides = editedRaw[row.tempId];
    return overrides ? { ...row, raw: { ...row.raw, ...overrides } } : row;
  }

  function handleFieldChange(tempId: string, header: string, value: string): void {
    setEditedRaw((prev) => ({
      ...prev,
      [tempId]: { ...prev[tempId], [header]: value },
    }));
  }

  function handleOverrideChange(tempId: string, fieldKey: string, value: string): void {
    setFieldOverrides((prev) => ({
      ...prev,
      [tempId]: { ...prev[tempId], [fieldKey]: value },
    }));
  }

  function getInvalidFieldKeys(row: SpreadsheetRow): Set<string> {
    const keys = new Set<string>();
    for (const f of fields) {
      if (!f.required) continue;
      const header = mapping[f.key];
      if (!header || !row.raw[header]?.trim()) keys.add(f.key);
    }
    for (const key of serverMissingFields[row.tempId] ?? []) keys.add(key);
    return keys;
  }

  // Fields with no CSV column can still get a manually typed value per row (fieldOverrides).
  // To feed those into the same raw+mapping contract the backend already understands, they're
  // surfaced as a synthetic header rather than a real column name.
  function overrideHeaderFor(fieldKey: string): string {
    return `__override__${fieldKey}`;
  }

  function buildConfirmMapping(): Record<string, string | null> {
    const result = { ...mapping };
    for (const field of fields) {
      if (result[field.key]) continue;
      const hasAnyOverride = Object.values(fieldOverrides).some((o) => o[field.key]?.trim());
      if (hasAnyOverride) result[field.key] = overrideHeaderFor(field.key);
    }
    return result;
  }

  function buildConfirmRow(row: SpreadsheetRow): SpreadsheetRow {
    const overrides = fieldOverrides[row.tempId];
    if (!overrides) return row;
    const extraRaw: Record<string, string> = {};
    for (const [fieldKey, value] of Object.entries(overrides)) {
      extraRaw[overrideHeaderFor(fieldKey)] = value;
    }
    return { ...row, raw: { ...row.raw, ...extraRaw } };
  }

  const effectiveRows = (parseResult?.rows ?? []).map(getEffectiveRow);
  const activeRows = effectiveRows.filter((r) => !removedIds.has(r.tempId));
  const activeGoalRows = goalRows.filter((r) => !goalRemovedIds.has(r.tempId));
  const confirmMapping = buildConfirmMapping();
  const confirmRows = activeRows.map(buildConfirmRow);

  function validateBeforeConfirm(): string {
    if (!periodId) return 'Selecione um período.';
    if (activeRows.length === 0) return 'Não há transações para importar.';

    const incompleteCount = activeRows.filter((r) => getInvalidFieldKeys(r).size > 0).length;
    if (incompleteCount > 0) {
      const noun = incompleteCount === 1 ? 'transação está' : 'transações estão';
      return `${incompleteCount} ${noun} com campo obrigatório ausente. Preencha os valores destacados ou remova essas linhas antes de importar.`;
    }

    return '';
  }

  async function handleConfirmSpreadsheet(): Promise<void> {
    if (!parseResult || entityType === 'goals') return;

    const validationError = validateBeforeConfirm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setConfirming(true);
    try {
      const result = await spreadsheetImportService.confirm({
        entityType,
        periodId,
        mapping: confirmMapping,
        rows: confirmRows,
      });

      if (result.created === 0) {
        const missingByRow: Record<string, string[]> = {};
        for (const s of result.skipped) missingByRow[s.tempId] = s.missingFields;
        setServerMissingFields(missingByRow);
        setError(
          `Nenhum registro foi importado. ${result.skipped.length} linha(s) não puderam ser ` +
          'importadas — verifique os campos destacados abaixo antes de tentar novamente.',
        );
        return;
      }

      setImportedCount(result.created);
      setSkippedCount(result.skipped.length);
      setStep('success');
    } catch {
      // HTTP-level failures already surface a toast via apiClient; this covers anything else
      // (e.g. an unexpected response shape) so the user always gets visible feedback.
      setError('Ocorreu um erro ao importar. Tente novamente.');
    } finally {
      setConfirming(false);
    }
  }

  async function handleConfirmGoals(): Promise<void> {
    setError('');
    setConfirming(true);
    try {
      const result = await goalsImportService.confirmGoals(goalId, activeGoalRows);
      setImportedCount(result.created);
      setSkippedCount(0);
      setStep('success');
    } catch {
      setError('Ocorreu um erro ao importar. Tente novamente.');
    } finally {
      setConfirming(false);
    }
  }

  function resetAll(): void {
    setStep('select-target');
    setParseResult(null);
    setMapping({});
    setRemovedIds(new Set());
    setEditedRaw({});
    setFieldOverrides({});
    setServerMissingFields({});
    setGoalRows([]);
    setGoalRemovedIds(new Set());
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[50vh]">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold">Importação concluída!</h1>
        <p className="text-muted-foreground">{importedCount} registro(s) importado(s) com sucesso.</p>
        {skippedCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {skippedCount} linha(s) puladas por falta de um campo obrigatório.
          </p>
        )}
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={resetAll}>Importar outra planilha</Button>
        </div>
      </div>
    );
  }

  if (step === 'review' && entityType === 'goals') {
    return (
      <div className="flex flex-col gap-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Revisar Importação — Metas</h1>
            <p className="text-sm text-muted-foreground">
              {goalRows.length} registros encontrados · {goalRemovedIds.size} removidos ·{' '}
              <span className="font-medium">{activeGoalRows.length} serão importados</span>
            </p>
          </div>
          <Button variant="outline" onClick={() => setStep('upload')}>Outro arquivo</Button>
        </div>

        <div className="flex flex-col gap-2">
          {goalRows.map((row) => {
            const removed = goalRemovedIds.has(row.tempId);
            return (
              <Card key={row.tempId} className={removed ? 'opacity-40' : ''}>
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <p className="font-medium">{MONTH_NAMES[row.month - 1]} {row.year}</p>
                  <div className="text-right shrink-0">
                    <p className="text-sm">Previsto: {formatCurrency(row.plannedAmount)}</p>
                    {row.actualAmount !== null && <p className="text-xs text-muted-foreground">Real: {formatCurrency(row.actualAmount)}</p>}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setGoalRemovedIds((prev) => {
                      const next = new Set(prev);
                      if (removed) next.delete(row.tempId); else next.add(row.tempId);
                      return next;
                    })}
                  >
                    {removed ? 'Restaurar' : 'Remover'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={resetAll}>Cancelar</Button>
          <Button onClick={handleConfirmGoals} disabled={confirming || activeGoalRows.length === 0}>
            {confirming ? 'Importando...' : `Importar ${activeGoalRows.length} registros`}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'mapping' && parseResult) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <div>
          <h1 className="text-2xl font-bold">Mapear colunas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Conecte cada coluna do arquivo ao campo correspondente. Arraste uma coluna à esquerda até o campo desejado à direita.
          </p>
        </div>

        <ColumnMapping headers={parseResult.headers} fields={fields} mapping={mapping} onChange={setMapping} />

        {missingRequiredFields.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Campos obrigatórios sem mapeamento: {missingRequiredFields.map((f) => f.label).join(', ')}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setStep('upload')}>Voltar</Button>
          <Button onClick={() => setStep('review')} disabled={missingRequiredFields.length > 0}>
            Continuar
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'review' && parseResult) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Revisar Importação</h1>
            <p className="text-sm text-muted-foreground">
              {parseResult.rows.length} transações encontradas · {removedIds.size} removidas ·{' '}
              <span className="font-medium">{activeRows.length} serão importadas</span>
            </p>
          </div>
          <Button variant="outline" onClick={() => setStep('mapping')}>Ajustar mapeamento</Button>
        </div>

        <LookupSummary fields={fields} mapping={confirmMapping} rows={confirmRows} existingNamesByKind={existingNamesByKind} />

        <div className="flex flex-col gap-2">
          {effectiveRows.map((row) => (
            <RowReviewCard
              key={row.tempId}
              row={row}
              headers={parseResult.headers}
              mapping={mapping}
              fields={fields}
              overrides={fieldOverrides[row.tempId] ?? {}}
              existingNamesByKind={existingNamesByKind}
              removed={removedIds.has(row.tempId)}
              invalidFieldKeys={getInvalidFieldKeys(row)}
              onToggleRemove={() => setRemovedIds((prev) => {
                const next = new Set(prev);
                if (next.has(row.tempId)) next.delete(row.tempId); else next.add(row.tempId);
                return next;
              })}
              onFieldChange={(header, value) => handleFieldChange(row.tempId, header, value)}
              onOverrideChange={(fieldKey, value) => handleOverrideChange(row.tempId, fieldKey, value)}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={resetAll}>Cancelar</Button>
          <Button onClick={handleConfirmSpreadsheet} disabled={confirming || activeRows.length === 0}>
            {confirming ? 'Importando...' : `Importar ${activeRows.length} transações`}
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
            Importar planilha — {TABLE_OPTIONS.find((t) => t.value === entityType)?.label}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envie um arquivo CSV. As colunas podem ter qualquer nome — você poderá conferir e ajustar o mapeamento no próximo passo.
          </p>
        </div>

        <div
          className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">Clique ou arraste o arquivo CSV</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
          />
        </div>

        {uploading && <p className="text-sm text-center text-muted-foreground">Processando...</p>}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <Button variant="outline" onClick={() => setStep('select-target')}>Voltar</Button>
      </div>
    );
  }

  const canContinue = entityType === 'goals' ? !!goalId : !!periodId;

  return (
    <div className="flex flex-col gap-6 p-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Importar planilha</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione o que deseja importar e o destino antes de enviar o arquivo.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {TABLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setEntityType(opt.value)}
            className={`text-left rounded-xl border p-5 transition-colors ${
              entityType === opt.value ? 'border-primary bg-primary/5' : 'hover:border-primary/50 hover:bg-accent/30'
            }`}
          >
            <p className="font-semibold">{opt.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{opt.description}</p>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Destino</CardTitle></CardHeader>
        <CardContent>
          {entityType !== 'goals' ? (
            <div className="flex flex-col gap-1.5 max-w-xs">
              <Label>Período *</Label>
              <Select value={periodId} onChange={(e) => setPeriodId(e.target.value)}>
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>{MONTH_NAMES[p.month - 1]} {p.year}</option>
                ))}
              </Select>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 max-w-xs">
              <Label>Meta *</Label>
              <Select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
                {goals.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setStep('upload')} disabled={!canContinue}>Continuar</Button>
      </div>
    </div>
  );
}
