import { randomUUID } from 'node:crypto';

export interface ParsedTransaction {
  tempId: string;
  date: string;
  description: string;
  amount: number;
}

export function parseOFX(content: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  // Extract all STMTTRN blocks
  const blockRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let block: RegExpExecArray | null;

  while ((block = blockRegex.exec(content)) !== null) {
    const body = block[1];

    const type = extractTag(body, 'TRNTYPE');
    const rawDate = extractTag(body, 'DTPOSTED');
    const rawAmount = extractTag(body, 'TRNAMT');
    const memo = extractTag(body, 'MEMO') || extractTag(body, 'NAME') || '';

    if (!rawDate || !rawAmount) continue;

    const amount = Math.abs(parseFloat(rawAmount.replace(',', '.')));
    if (isNaN(amount) || amount === 0) continue;

    // Only import debits (expenses)
    if (type?.toUpperCase() === 'CREDIT') continue;

    const date = parseOFXDate(rawDate);
    if (!date) continue;

    transactions.push({
      tempId: randomUUID(),
      date,
      description: memo.trim(),
      amount,
    });
  }

  return transactions;
}

function extractTag(content: string, tag: string): string | null {
  const match = new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i').exec(content);
  return match ? match[1].trim() : null;
}

function parseOFXDate(raw: string): string | null {
  // Format: YYYYMMDDHHMMSS or YYYYMMDD[offset]
  const match = /^(\d{4})(\d{2})(\d{2})/.exec(raw);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${year}-${month}-${day}`;
}
