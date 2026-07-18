'use client';

import type { JSX } from 'react';

import type { ImportFieldDef, ImportFieldKind } from 'shared-types';

import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { cn } from '../../../lib/utils';
import type { SpreadsheetRow } from '../../../services/spreadsheet-import.service';

import { LookupValueInput } from './lookup-value-input';

interface RowReviewCardProps {
  row: SpreadsheetRow;
  headers: string[];
  mapping: Record<string, string | null>;
  fields: ImportFieldDef[];
  overrides: Record<string, string>;
  existingNamesByKind: Partial<Record<ImportFieldKind, string[]>>;
  removed: boolean;
  invalidFieldKeys: Set<string>;
  onToggleRemove: () => void;
  onFieldChange: (header: string, value: string) => void;
  onOverrideChange: (fieldKey: string, value: string) => void;
}

export function RowReviewCard({
  row,
  headers,
  mapping,
  fields,
  overrides,
  existingNamesByKind,
  removed,
  invalidFieldKeys,
  onToggleRemove,
  onFieldChange,
  onOverrideChange,
}: RowReviewCardProps): JSX.Element {
  const mappedHeaders = new Set(fields.map((f) => mapping[f.key]).filter((h): h is string => !!h));
  const unmappedHeaders = headers.filter((h) => !mappedHeaders.has(h));
  const hasInvalidField = invalidFieldKeys.size > 0;

  return (
    <Card className={removed ? 'opacity-40' : hasInvalidField ? 'border-destructive/50' : ''}>
      <CardContent className="flex flex-col gap-3 py-3 px-4">
        <div className="grid flex-1 min-w-0 grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => {
            const header = mapping[field.key];
            const value = header ? (row.raw[header] ?? '') : (overrides[field.key] ?? '');
            const isLookup = field.kind.startsWith('lookup-');
            const isInvalid = invalidFieldKeys.has(field.key);
            const handleChange = (v: string): void => {
              if (header) onFieldChange(header, v);
              else onOverrideChange(field.key, v);
            };

            return (
              <div key={field.key} className="min-w-0">
                <div className={cn('flex items-center gap-1.5 text-xs mb-1 truncate', isInvalid ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                  {field.label}
                  {field.required && <span className="text-destructive">*</span>}
                  {!header && <Badge variant="outline" className="shrink-0">sem coluna</Badge>}
                </div>
                {isLookup ? (
                  <LookupValueInput
                    value={value}
                    options={existingNamesByKind[field.kind] ?? []}
                    invalid={isInvalid}
                    onChange={handleChange}
                  />
                ) : (
                  <Input
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    disabled={removed}
                    placeholder={header ? undefined : 'Não informado'}
                    className={cn('h-8 text-sm', isInvalid && 'border-destructive focus-visible:ring-destructive')}
                  />
                )}
                {isInvalid && <p className="mt-0.5 text-xs text-destructive">Obrigatório</p>}
              </div>
            );
          })}
        </div>

        {unmappedHeaders.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
            {unmappedHeaders.map((header) => (
              <span key={header}>
                {header}: {row.raw[header] || '—'}
              </span>
            ))}
          </div>
        )}

        <div className="flex shrink-0 items-center justify-end gap-2">
          {hasInvalidField && <Badge variant="warning">campo obrigatório ausente</Badge>}
          <Button size="sm" variant="ghost" onClick={onToggleRemove}>
            {removed ? 'Restaurar' : 'Remover'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
