'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { referenceService, type StatusOption, type StatusOptionWithColor, type PaymentMethodOption } from '../../services/reference.service';
import type { Category, ExpenseType } from '../../lib/types';
import { StatusOptionSection } from '../../components/features/status-option-section';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../../components/ui/dialog';
import { Separator } from '../../components/ui/separator';

// ── List item with inline edit ────────────────────────────────────────

interface ListItemProps {
  label: string;
  sublabel?: string;
  hasExtra?: boolean;
  extraLabel?: string;
  extraValue?: string;
  onEdit: (name: string, extra?: string) => Promise<void>;
  onDelete: () => Promise<void>;
}

function ListItem({ label, sublabel, hasExtra, extraLabel, extraValue, onEdit, onDelete }: ListItemProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(label);
  const [extra, setExtra] = useState(extraValue ?? '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onEdit(name.trim(), extra.trim() || undefined);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try { await onDelete(); } finally {
      setSaving(false);
      setConfirmDelete(false);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Nome</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter' && !hasExtra) handleSave(); if (e.key === 'Escape') setEditing(false); }}
          />
        </div>
        {hasExtra && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">{extraLabel}</Label>
            <Input
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
            />
          </div>
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Check className="h-3.5 w-3.5" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
            <X className="h-3.5 w-3.5" />
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between py-1.5 px-1 rounded-lg hover:bg-muted/40 group">
        <div>
          <p className="text-sm font-medium">{label}</p>
          {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
        </div>
        <div className="flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir "{label}"?</DialogTitle>
            <DialogDescription>
              Lançamentos já registrados não serão afetados, mas este item não estará disponível para novos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={saving}>Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Add form ──────────────────────────────────────────────────────────

interface AddFormProps {
  nameLabel: string;
  namePlaceholder: string;
  hasExtra?: boolean;
  extraLabel?: string;
  extraPlaceholder?: string;
  onAdd: (name: string, extra?: string) => Promise<void>;
}

function AddForm({ nameLabel, namePlaceholder, hasExtra, extraLabel, extraPlaceholder, onAdd }: AddFormProps) {
  const [name, setName] = useState('');
  const [extra, setExtra] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onAdd(name.trim(), extra.trim() || undefined);
      setName('');
      setExtra('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-4 mt-2 border-t border-border">
      <div className="flex flex-col gap-1.5">
        <Label>{nameLabel}</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={namePlaceholder}
        />
      </div>
      {hasExtra && (
        <div className="flex flex-col gap-1.5">
          <Label>{extraLabel}</Label>
          <Input
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder={extraPlaceholder}
          />
        </div>
      )}
      <Button type="submit" disabled={loading || !name.trim()} className="self-start">
        <Plus className="h-4 w-4" />
        {loading ? 'Adicionando...' : 'Adicionar'}
      </Button>
    </form>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [incomeStatusOptions, setIncomeStatusOptions] = useState<StatusOptionWithColor[]>([]);
  const [expenseStatusOptions, setExpenseStatusOptions] = useState<StatusOptionWithColor[]>([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<PaymentMethodOption[]>([]);
  const [sourceOptions, setSourceOptions] = useState<StatusOption[]>([]);

  function loadData() {
    referenceService.categories('INCOME').then(setIncomeCategories).catch(() => undefined);
    referenceService.categories('EXPENSE').then(setExpenseCategories).catch(() => undefined);
    referenceService.expenseTypes().then(setExpenseTypes).catch(() => undefined);
    referenceService.incomeStatusOptions().then(setIncomeStatusOptions).catch(() => undefined);
    referenceService.expenseStatusOptions().then(setExpenseStatusOptions).catch(() => undefined);
    referenceService.paymentMethodOptions().then(setPaymentMethodOptions).catch(() => undefined);
    referenceService.sourceOptions().then(setSourceOptions).catch(() => undefined);
  }

  useEffect(() => { loadData(); }, []);

  function renderCategoryList(cats: Category[], kind: 'INCOME' | 'EXPENSE') {
    return (
      <>
        {cats.length === 0 ? (
          <p className="text-sm text-muted-foreground pb-2">Nenhuma categoria cadastrada.</p>
        ) : (
          <div className="flex flex-col">
            {cats.map((cat, i) => (
              <div key={cat.id}>
                <ListItem
                  label={cat.name}
                  onEdit={(name) => referenceService.updateCategory(cat.id, name).then(loadData)}
                  onDelete={() => referenceService.deleteCategory(cat.id).then(loadData)}
                />
                {i < cats.length - 1 && <Separator className="my-0.5 opacity-50" />}
              </div>
            ))}
          </div>
        )}
        <AddForm
          nameLabel="Nova categoria"
          namePlaceholder={kind === 'INCOME' ? 'Ex: Salário, Benefícios…' : 'Ex: Moradia, Alimentação…'}
          onAdd={async (name) => { await referenceService.createCategory(name, kind); loadData(); }}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-3xl">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categorias de Receita</CardTitle>
            <CardDescription>Ex: Salário, Benefícios, Freelance, Investimentos…</CardDescription>
          </CardHeader>
          <CardContent>
            {renderCategoryList(incomeCategories, 'INCOME')}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categorias de Gasto</CardTitle>
            <CardDescription>Ex: Moradia, Alimentação, Pet, Saúde…</CardDescription>
          </CardHeader>
          <CardContent>
            {renderCategoryList(expenseCategories, 'EXPENSE')}
          </CardContent>
        </Card>

        {/* Expense Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tipos de Gasto</CardTitle>
            <CardDescription>Dimensão orçamentária: Custos Fixos, Conforto, Prazeres…</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground pb-2">Nenhum tipo cadastrado.</p>
            ) : (
              <div className="flex flex-col">
                {expenseTypes.map((type, i) => (
                  <div key={type.id}>
                    <ListItem
                      label={type.name}
                      sublabel={type.description ?? undefined}
                      hasExtra
                      extraLabel="Descrição (opcional)"
                      extraValue={type.description ?? ''}
                      onEdit={(name, desc) => referenceService.updateExpenseType(type.id, name, desc).then(loadData)}
                      onDelete={() => referenceService.deleteExpenseType(type.id).then(loadData)}
                    />
                    {i < expenseTypes.length - 1 && <Separator className="my-0.5 opacity-50" />}
                  </div>
                ))}
              </div>
            )}
            <AddForm
              nameLabel="Novo tipo"
              namePlaceholder="Ex: Custos Fixos, Conforto…"
              hasExtra
              extraLabel="Descrição"
              extraPlaceholder="Opcional"
              onAdd={async (name, desc) => { await referenceService.createExpenseType(name, desc); loadData(); }}
            />
          </CardContent>
        </Card>

        {/* Income Status Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status de Receita</CardTitle>
            <CardDescription>Ex: Pendente, Recebida, Parcialmente recebida…</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusOptionSection
              options={incomeStatusOptions}
              onCreate={async (name, color) => { await referenceService.createIncomeStatusOption(name, color); loadData(); }}
              onUpdate={async (id, name, color) => { await referenceService.updateIncomeStatusOption(id, name, color); loadData(); }}
              onDelete={async (id) => { await referenceService.deleteIncomeStatusOption(id); loadData(); }}
            />
          </CardContent>
        </Card>

        {/* Expense Status Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status de Gasto</CardTitle>
            <CardDescription>Ex: Estimado, Pendente, Pago, Cancelado…</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusOptionSection
              options={expenseStatusOptions}
              onCreate={async (name, color) => { await referenceService.createExpenseStatusOption(name, color); loadData(); }}
              onUpdate={async (id, name, color) => { await referenceService.updateExpenseStatusOption(id, name, color); loadData(); }}
              onDelete={async (id) => { await referenceService.deleteExpenseStatusOption(id); loadData(); }}
            />
          </CardContent>
        </Card>

        {/* Payment Method Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Formas de Pagamento</CardTitle>
            <CardDescription>Ex: PIX, Débito, Crédito, Flash, Dinheiro…</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentMethodOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground pb-2">Nenhuma forma cadastrada.</p>
            ) : (
              <div className="flex flex-col">
                {paymentMethodOptions.map((opt, i) => (
                  <div key={opt.id}>
                    <ListItem
                      label={opt.name}
                      onEdit={(name) => referenceService.createPaymentMethodOption(name).then(loadData)}
                      onDelete={() => referenceService.deletePaymentMethodOption(opt.id).then(loadData)}
                    />
                    {i < paymentMethodOptions.length - 1 && <Separator className="my-0.5 opacity-50" />}
                  </div>
                ))}
              </div>
            )}
            <AddForm
              nameLabel="Nova forma"
              namePlaceholder="Ex: PIX, Flash, Nubank…"
              onAdd={async (name) => { await referenceService.createPaymentMethodOption(name); loadData(); }}
            />
          </CardContent>
        </Card>

        {/* Source Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fontes</CardTitle>
            <CardDescription>Onde o dinheiro foi recebido ou gasto. Ex: Nubank, Itaú, Flash, iFood…</CardDescription>
          </CardHeader>
          <CardContent>
            {sourceOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground pb-2">Nenhuma fonte cadastrada.</p>
            ) : (
              <div className="flex flex-col">
                {sourceOptions.map((opt, i) => (
                  <div key={opt.id}>
                    <ListItem
                      label={opt.name}
                      onEdit={(name) => referenceService.createSourceOption(name).then(loadData)}
                      onDelete={() => referenceService.deleteSourceOption(opt.id).then(loadData)}
                    />
                    {i < sourceOptions.length - 1 && <Separator className="my-0.5 opacity-50" />}
                  </div>
                ))}
              </div>
            )}
            <AddForm
              nameLabel="Nova fonte"
              namePlaceholder="Ex: Nubank, Flash, Itaú…"
              onAdd={async (name) => { await referenceService.createSourceOption(name); loadData(); }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
