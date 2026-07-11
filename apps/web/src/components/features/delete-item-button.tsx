'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { apiClient } from '../../lib/http-client';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../ui/dialog';

interface DeleteItemButtonProps {
  id: string;
  endpoint: string;
  label: string;
}

export function DeleteItemButton({ id, endpoint, label }: DeleteItemButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await apiClient.delete(`${endpoint}/${id}`);
      setOpen(false);
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir lançamento</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir <strong>{label}</strong>? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>Cancelar</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
