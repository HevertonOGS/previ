'use client';

import { useState, type JSX } from 'react';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { cn } from '../../../lib/utils';

const NEW_VALUE_SENTINEL = '__new__';

interface LookupValueInputProps {
  value: string;
  options: string[];
  invalid?: boolean;
  onChange: (value: string) => void;
}

export function LookupValueInput({ value, options, invalid, onChange }: LookupValueInputProps): JSX.Element {
  const matchedOption = options.find((o) => o.toLowerCase() === value.trim().toLowerCase());
  const [customMode, setCustomMode] = useState(!!value && !matchedOption);

  if (customMode) {
    return (
      <div className="flex items-center gap-1.5">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Novo valor"
          className={cn('h-8 text-sm', invalid && 'border-destructive focus-visible:ring-destructive')}
        />
        {options.length > 0 && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 shrink-0 px-2 text-xs"
            onClick={() => setCustomMode(false)}
          >
            Selecionar existente
          </Button>
        )}
      </div>
    );
  }

  return (
    <Select
      className={cn('h-8 text-sm', invalid && 'border-destructive focus-visible:ring-destructive')}
      value={matchedOption ?? ''}
      onChange={(e) => {
        if (e.target.value === NEW_VALUE_SENTINEL) {
          setCustomMode(true);
          onChange('');
        } else {
          onChange(e.target.value);
        }
      }}
    >
      <option value="" disabled>Selecione...</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
      <option value={NEW_VALUE_SENTINEL}>+ Novo valor…</option>
    </Select>
  );
}
