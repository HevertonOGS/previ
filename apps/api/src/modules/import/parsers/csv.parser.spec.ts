import { parseCSV } from './csv.parser';

const NUBANK_CSV = `date,title,amount
2026-07-01,Mercado Livre,-150.00
2026-07-03,iFood Pedido,-50.50
2026-07-05,Recarga de Crédito,100.00
`;

const PTBR_CSV = `Data;Descrição;Valor
01/07/2026;Mercado Livre;-150,00
03/07/2026;iFood Pedido;-50,50
`;

describe('parseCSV', () => {
  describe('Nubank format', () => {
    it('should detect and parse Nubank CSV format', () => {
      const result = parseCSV(NUBANK_CSV);

      expect(result).toHaveLength(3);
    });

    it('should parse amounts as positive numbers', () => {
      const result = parseCSV(NUBANK_CSV);

      expect(result[0].amount).toBe(150);
      expect(result[1].amount).toBe(50.5);
    });

    it('should parse dates in YYYY-MM-DD format', () => {
      const result = parseCSV(NUBANK_CSV);

      expect(result[0].date).toBe('2026-07-01');
    });

    it('should extract description', () => {
      const result = parseCSV(NUBANK_CSV);

      expect(result[0].description).toBe('Mercado Livre');
    });
  });

  describe('pt-BR generic format (DD/MM/YYYY)', () => {
    it('should parse DD/MM/YYYY dates correctly', () => {
      const result = parseCSV(PTBR_CSV);

      expect(result[0].date).toBe('2026-07-01');
      expect(result[1].date).toBe('2026-07-03');
    });

    it('should parse pt-BR decimal amounts', () => {
      const result = parseCSV(PTBR_CSV);

      expect(result[0].amount).toBe(150);
      expect(result[1].amount).toBe(50.5);
    });
  });

  describe('custom column mapping', () => {
    it('should accept a custom mapping', () => {
      const custom = `Dt;Hist;Val\n01/07/2026;Mercado;-99,90\n`;
      const result = parseCSV(custom, { date: 'Dt', description: 'Hist', amount: 'Val' });

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(99.9);
      expect(result[0].description).toBe('Mercado');
    });
  });

  it('should return empty array for empty CSV', () => {
    const result = parseCSV('Data,Descrição,Valor\n');

    expect(result).toHaveLength(0);
  });

  it('should assign unique tempIds', () => {
    const result = parseCSV(NUBANK_CSV);

    const ids = result.map((r) => r.tempId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
