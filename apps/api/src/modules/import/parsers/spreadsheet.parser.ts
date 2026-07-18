import { randomUUID } from 'node:crypto';

import { IMPORT_FIELD_DEFS, type ImportEntityType } from 'shared-types';

import { parseRows, parseAmount, parseDate } from './csv-helpers';

export interface SpreadsheetRow {
  tempId: string;
  raw: Record<string, string>;
}

export interface ParsedSpreadsheet {
  headers: string[];
  rows: SpreadsheetRow[];
  suggestedMapping: Record<string, string | null>;
}

export interface ExtractedRow {
  values: Record<string, string | number | null>;
  missingRequired: string[];
}

export function suggestMapping(
  headers: string[],
  entityType: ImportEntityType,
): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  for (const def of IMPORT_FIELD_DEFS[entityType]) {
    const match = headers.find((h) => def.synonyms.includes(h.toLowerCase().trim()));
    result[def.key] = match ?? null;
  }
  return result;
}

export function parseSpreadsheet(content: string, entityType: ImportEntityType): ParsedSpreadsheet {
  const rows = parseRows(content);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return {
    headers,
    rows: rows.map((raw) => ({ tempId: randomUUID(), raw })),
    suggestedMapping: suggestMapping(headers, entityType),
  };
}

export function extractRow(
  raw: Record<string, string>,
  mapping: Record<string, string | null | undefined>,
  entityType: ImportEntityType,
): ExtractedRow {
  const values: Record<string, string | number | null> = {};
  const missingRequired: string[] = [];

  for (const def of IMPORT_FIELD_DEFS[entityType]) {
    const header = mapping[def.key];
    const rawValue = header ? (raw[header] ?? '').trim() : '';

    let value: string | number | null;
    if (!rawValue) {
      value = null;
    } else if (def.kind === 'money') {
      value = parseAmount(rawValue);
    } else if (def.kind === 'date') {
      value = parseDate(rawValue);
    } else {
      value = rawValue;
    }

    values[def.key] = value;
    if (def.required && value === null) {
      missingRequired.push(def.key);
    }
  }

  return { values, missingRequired };
}
