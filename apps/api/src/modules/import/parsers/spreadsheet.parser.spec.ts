import { suggestMapping, parseSpreadsheet, extractRow } from './spreadsheet.parser';

const CURRENT_EXPENSE_CSV = `Gasto,Tipo,Categoria,Quando,Valor,Forma de pagamento,Observação Interna
Supermercado,Alimentação,Mercado,15/07/2026,350.90,Débito,compra do mês
Cinema,Lazer,Lazer,16/07/2026,60.00,Vale Cultura,
Ingresso,Lazer,Lazer,,45.00,Vale Cultura,data ausente
`;

describe('suggestMapping', () => {
  it('should auto-detect columns for current-expense using field synonyms', () => {
    const mapping = suggestMapping(
      ['Gasto', 'Tipo', 'Categoria', 'Quando', 'Valor', 'Forma de pagamento', 'Observação Interna'],
      'current-expense',
    );

    expect(mapping.name).toBe('Gasto');
    expect(mapping.expenseType).toBe('Tipo');
    expect(mapping.category).toBe('Categoria');
    expect(mapping.paidAt).toBe('Quando');
    expect(mapping.amount).toBe('Valor');
    expect(mapping.paymentMethod).toBe('Forma de pagamento');
  });

  it('should leave a field unmapped when no header matches', () => {
    const mapping = suggestMapping(['Gasto', 'Valor'], 'current-expense');
    expect(mapping.notes).toBeNull();
  });

  it('should not auto-map a header with no matching synonym to any field', () => {
    const mapping = suggestMapping(
      ['Gasto', 'Tipo', 'Categoria', 'Quando', 'Valor', 'Forma de pagamento', 'Observação Interna'],
      'current-expense',
    );
    expect(Object.values(mapping)).not.toContain('Observação Interna');
  });

  it('should match headers case-insensitively', () => {
    const mapping = suggestMapping(['gasto', 'VALOR'], 'current-expense');
    expect(mapping.name).toBe('gasto');
    expect(mapping.amount).toBe('VALOR');
  });
});

describe('parseSpreadsheet', () => {
  it('should return every raw row without filtering incomplete ones', () => {
    const result = parseSpreadsheet(CURRENT_EXPENSE_CSV, 'current-expense');
    expect(result.rows).toHaveLength(3);
  });

  it('should return the original headers', () => {
    const result = parseSpreadsheet(CURRENT_EXPENSE_CSV, 'current-expense');
    expect(result.headers).toEqual([
      'Gasto', 'Tipo', 'Categoria', 'Quando', 'Valor', 'Forma de pagamento', 'Observação Interna',
    ]);
  });

  it('should assign a unique tempId per row', () => {
    const result = parseSpreadsheet(CURRENT_EXPENSE_CSV, 'current-expense');
    const ids = result.rows.map((r) => r.tempId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should include a suggested mapping', () => {
    const result = parseSpreadsheet(CURRENT_EXPENSE_CSV, 'current-expense');
    expect(result.suggestedMapping.amount).toBe('Valor');
  });

  it('should preserve raw string values per row', () => {
    const result = parseSpreadsheet(CURRENT_EXPENSE_CSV, 'current-expense');
    expect(result.rows[0].raw['Gasto']).toBe('Supermercado');
    expect(result.rows[0].raw['Valor']).toBe('350.90');
  });
});

describe('extractRow', () => {
  const mapping = {
    name: 'Gasto',
    expenseType: 'Tipo',
    category: 'Categoria',
    paidAt: 'Quando',
    amount: 'Valor',
    paymentMethod: 'Forma de pagamento',
    notes: 'Observação Interna',
  };

  it('should extract and convert values per the confirmed mapping', () => {
    const raw = {
      Gasto: 'Supermercado',
      Tipo: 'Alimentação',
      Categoria: 'Mercado',
      Quando: '15/07/2026',
      Valor: '350.90',
      'Forma de pagamento': 'Débito',
      'Observação Interna': 'compra do mês',
    };

    const result = extractRow(raw, mapping, 'current-expense');

    expect(result.values.name).toBe('Supermercado');
    expect(result.values.expenseType).toBe('Alimentação');
    expect(result.values.category).toBe('Mercado');
    expect(result.values.paidAt).toBe('2026-07-15');
    expect(result.values.amount).toBe(350.9);
    expect(result.values.paymentMethod).toBe('Débito');
    expect(result.values.notes).toBe('compra do mês');
    expect(result.missingRequired).toEqual([]);
  });

  it('should flag missing required fields', () => {
    const raw = {
      Gasto: 'Ingresso',
      Tipo: 'Lazer',
      Categoria: 'Lazer',
      Quando: '',
      Valor: '45.00',
      'Forma de pagamento': 'Vale Cultura',
      'Observação Interna': 'data ausente',
    };

    const result = extractRow(raw, mapping, 'current-expense');

    expect(result.missingRequired).toContain('paidAt');
  });

  it('should treat an unmapped optional field as null', () => {
    const raw = { Gasto: 'Cinema', Tipo: 'Lazer', Categoria: 'Lazer', Quando: '16/07/2026', Valor: '60.00', 'Forma de pagamento': 'Vale Cultura' };
    const partialMapping = { ...mapping, notes: null };

    const result = extractRow(raw, partialMapping, 'current-expense');

    expect(result.values.notes).toBeNull();
    expect(result.missingRequired).toEqual([]);
  });

  it('should flag a required field as missing when it is not mapped at all', () => {
    const raw = { Gasto: 'Cinema', Valor: '60.00' };
    const partialMapping = { name: 'Gasto', amount: 'Valor' };

    const result = extractRow(raw, partialMapping, 'current-expense');

    expect(result.missingRequired).toEqual(expect.arrayContaining(['expenseType', 'category', 'paidAt', 'paymentMethod']));
  });
});
