'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import type { StatusColor } from '../../lib/status-colors';
import { STATUS_COLORS, DEFAULT_STATUS_COLOR, statusColorMeta } from '../../lib/status-colors';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../ui/dialog';

interface ColorPickerProps {
  value: StatusColor;
  onChange: (color: StatusColor) => void;
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_COLORS.map((color) => {
        const meta = statusColorMeta(color);
        const active = value === color;
        return (
          <button
            key={color}
            type="button"
            title={meta.label}
            aria-label={meta.label}
            onClick={() => onChange(color)}
            className={`h-7 w-7 rounded-full ${meta.swatchClass} transition-shadow ${
              active ? 'ring-2 ring-offset-2 ring-primary' : 'hover:opacity-80'
            }`}
          />
        );
      })}
    </div>
  );
}

interface StatusOptionItem {
  id: string;
  name: string;
  color: StatusColor;
}

interface StatusOptionSectionProps {
  options: StatusOptionItem[];
  onCreate: (name: string, color: StatusColor) => Promise<void>;
  onUpdate: (id: string, name: string, color: StatusColor) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function StatusOptionRow({
  option,
  onUpdate,
  onDelete,
}: {
  option: StatusOptionItem;
  onUpdate: (id: string, name: string, color: StatusColor) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(option.name);
  const [color, setColor] = useState<StatusColor>(option.color);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onUpdate(option.id, name.trim(), color);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try { await onDelete(option.id); } finally {
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
            onKeyDown={(e) => { if (e.key === 'Escape') setEditing(false); }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Cor</Label>
          <ColorPicker value={color} onChange={setColor} />
        </div>
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
        <Badge variant={statusColorMeta(option.color).badgeVariant}>{option.name}</Badge>
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
            <DialogTitle>Excluir "{option.name}"?</DialogTitle>
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

export function StatusOptionSection({ options, onCreate, onUpdate, onDelete }: StatusOptionSectionProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<StatusColor>(DEFAULT_STATUS_COLOR);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onCreate(name.trim(), color);
      setName('');
      setColor(DEFAULT_STATUS_COLOR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground pb-2">Nenhum status cadastrado.</p>
      ) : (
        <div className="flex flex-col">
          {options.map((option, i) => (
            <div key={option.id}>
              <StatusOptionRow option={option} onUpdate={onUpdate} onDelete={onDelete} />
              {i < options.length - 1 && <Separator className="my-0.5 opacity-50" />}
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-4 mt-2 border-t border-border">
        <div className="flex flex-col gap-1.5">
          <Label>Novo status</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Recebida, Cancelada…" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Cor</Label>
          <ColorPicker value={color} onChange={setColor} />
        </div>
        <Button type="submit" disabled={loading || !name.trim()} className="self-start">
          <Plus className="h-4 w-4" />
          {loading ? 'Adicionando...' : 'Adicionar'}
        </Button>
      </form>
    </>
  );
}
