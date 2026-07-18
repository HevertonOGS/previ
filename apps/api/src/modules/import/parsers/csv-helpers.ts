import { parse } from 'csv-parse/sync';

export function parseRows(content: string): Record<string, string>[] {
  const delimiter = content.split('\n')[0]?.includes(';') ? ';' : ',';
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    delimiter,
    relax_column_count: true,
  }) as Record<string, string>[];
}

export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^\d,.-]/g, '');
  if (!cleaned) return 0;
  if (cleaned.includes(',') && !cleaned.includes('.')) {
    return Math.abs(parseFloat(cleaned.replace(',', '.')));
  }
  if (cleaned.includes('.') && cleaned.includes(',')) {
    const last = Math.max(cleaned.lastIndexOf('.'), cleaned.lastIndexOf(','));
    const sep = cleaned[last];
    return sep === ','
      ? Math.abs(parseFloat(cleaned.replace(/\./g, '').replace(',', '.')))
      : Math.abs(parseFloat(cleaned.replace(/,/g, '')));
  }
  return Math.abs(parseFloat(cleaned));
}

const MONTH_NAMES: Record<string, string> = {
  janeiro: '01', jan: '01', fevereiro: '02', fev: '02',
  março: '03', marco: '03', mar: '03', abril: '04', abr: '04',
  maio: '05', mai: '05', junho: '06', jun: '06', julho: '07', jul: '07',
  agosto: '08', ago: '08', setembro: '09', set: '09',
  outubro: '10', out: '10', novembro: '11', nov: '11', dezembro: '12', dez: '12',
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', sep: '09', sept: '09',
  october: '10', november: '11', december: '12', dec: '12',
};

export function parseDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(trimmed);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;

  // "Month D, YYYY" / "Month D YYYY" (e.g. "July 1, 2026")
  const monthDY = /^([A-Za-zçãéóê]+)\.?\s+(\d{1,2}),?\s+(\d{4})$/.exec(trimmed);
  if (monthDY) {
    const month = MONTH_NAMES[monthDY[1].toLowerCase()];
    if (month) return `${monthDY[3]}-${month}-${monthDY[2].padStart(2, '0')}`;
  }

  // "D de Mês de YYYY" (pt-BR long form, e.g. "1 de julho de 2026")
  const dMonthY = /^(\d{1,2})\s+de\s+([A-Za-zçãéóê]+)\s+de\s+(\d{4})$/i.exec(trimmed);
  if (dMonthY) {
    const month = MONTH_NAMES[dMonthY[2].toLowerCase()];
    if (month) return `${dMonthY[3]}-${month}-${dMonthY[1].padStart(2, '0')}`;
  }

  return null;
}
