import { parseRows, parseAmount, parseDate } from './csv-helpers';

describe('parseRows', () => {
  it('should parse semicolon-delimited rows into objects keyed by header', () => {
    const csv = 'nome;valor\nMercado;150,00\n';
    const result = parseRows(csv);
    expect(result).toEqual([{ nome: 'Mercado', valor: '150,00' }]);
  });

  it('should parse comma-delimited rows when no semicolons are present', () => {
    const csv = 'nome,valor\nMercado,150.00\n';
    const result = parseRows(csv);
    expect(result).toEqual([{ nome: 'Mercado', valor: '150.00' }]);
  });
});

describe('parseAmount', () => {
  it('should parse pt-BR decimal amounts', () => {
    expect(parseAmount('150,00')).toBe(150);
  });

  it('should parse dotted-thousands with comma decimal', () => {
    expect(parseAmount('1.234,56')).toBe(1234.56);
  });

  it('should parse plain dot decimal amounts', () => {
    expect(parseAmount('150.50')).toBe(150.5);
  });

  it('should strip currency symbols', () => {
    expect(parseAmount('R$8.60')).toBe(8.6);
  });

  it('should return 0 for empty input', () => {
    expect(parseAmount('')).toBe(0);
  });
});

describe('parseDate', () => {
  it('should parse DD/MM/YYYY dates', () => {
    expect(parseDate('01/07/2026')).toBe('2026-07-01');
  });

  it('should parse single-digit DD/MM/YYYY dates', () => {
    expect(parseDate('1/7/2026')).toBe('2026-07-01');
  });

  it('should parse YYYY-MM-DD dates as-is', () => {
    expect(parseDate('2026-07-01')).toBe('2026-07-01');
  });

  it('should parse DD-MM-YYYY dates', () => {
    expect(parseDate('01-07-2026')).toBe('2026-07-01');
  });

  it('should parse "Month D, YYYY" English long-form dates', () => {
    expect(parseDate('July 1, 2026')).toBe('2026-07-01');
  });

  it('should parse "Month D YYYY" without a comma', () => {
    expect(parseDate('July 1 2026')).toBe('2026-07-01');
  });

  it('should parse abbreviated English month names', () => {
    expect(parseDate('Jul 1, 2026')).toBe('2026-07-01');
  });

  it('should parse pt-BR "D de Mês de YYYY" long-form dates', () => {
    expect(parseDate('1 de julho de 2026')).toBe('2026-07-01');
  });

  it('should be case-insensitive on month names', () => {
    expect(parseDate('JULY 1, 2026')).toBe('2026-07-01');
  });

  it('should return null for unrecognized formats', () => {
    expect(parseDate('not a date')).toBeNull();
  });

  it('should return null for empty input', () => {
    expect(parseDate('')).toBeNull();
  });
});
