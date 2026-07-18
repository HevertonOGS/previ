'use client';

import type { JSX } from 'react';

import type { ImportFieldDef, ImportFieldKind } from 'shared-types';

import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import type { SpreadsheetRow } from '../../../services/spreadsheet-import.service';

interface LookupSummaryProps {
  fields: ImportFieldDef[];
  mapping: Record<string, string | null>;
  rows: SpreadsheetRow[];
  existingNamesByKind: Partial<Record<ImportFieldKind, string[]>>;
}

export function LookupSummary({ fields, mapping, rows, existingNamesByKind }: LookupSummaryProps): JSX.Element | null {
  const lookupFields = fields.filter((f) => f.kind.startsWith('lookup-') && mapping[f.key]);
  if (lookupFields.length === 0) return null;

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Vínculos e criações</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-4">
        {lookupFields.map((field) => {
          const header = mapping[field.key] as string;
          const existingNames = new Set((existingNamesByKind[field.kind] ?? []).map((n) => n.toLowerCase()));
          const distinctValues = [
            ...new Set(rows.map((r) => r.raw[header]?.trim()).filter((v): v is string => !!v)),
          ];

          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <p className="text-sm font-medium">{field.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {distinctValues.map((value) => {
                  const exists = existingNames.has(value.toLowerCase());
                  return (
                    <Badge key={value} variant={exists ? 'success' : 'secondary'}>
                      {value} — {exists ? 'vincula a existente' : 'será criado'}
                    </Badge>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
