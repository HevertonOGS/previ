import {
  parseNotionIncomes,
  parseNotionGeneralExpenses,
  parseNotionCurrentExpenses,
  parseNotionGoals,
} from './notion.parser';

const INCOMES_CSV = `receita;categoria;previsão de recebimento;recebido em;status;valor
Salário;Salário;05/07/2026;07/07/2026;Recebido;8500,00
13º Salário;Salário;15/12/2026;;Pendente;8500,00
`;

const GENERAL_EXPENSES_CSV = `gasto;tipo;categoria;pagar em;valor estimado;pago em;valor pago;status;via de pagamento
Aluguel;Custos Fixos;Moradia;05/07/2026;1800,00;05/07/2026;1800,00;Pago;PIX
Internet;Custos Fixos;Moradia;10/07/2026;120,00;;;Pendente;
`;

const CURRENT_EXPENSES_CSV = `gasto;tipo;categoria;quando foi pago;valor;forma de pagamento
Mercado;Conforto;Alimentação;03/07/2026;250,50;Débito
iFood;Prazeres;Alimentação;05/07/2026;45,00;Crédito
`;

const GOALS_CSV = `mês;valor previsto;valor efetivamente guardado
Janeiro 2026;500,00;500,00
Fevereiro 2026;500,00;300,00
Março 2026;500,00;
`;

describe('parseNotionIncomes', () => {
  it('should parse income rows correctly', () => {
    const result = parseNotionIncomes(INCOMES_CSV);
    expect(result).toHaveLength(2);
  });

  it('should map name and category', () => {
    const result = parseNotionIncomes(INCOMES_CSV);
    expect(result[0].name).toBe('Salário');
    expect(result[0].category).toBe('Salário');
  });

  it('should parse expected amount', () => {
    const result = parseNotionIncomes(INCOMES_CSV);
    expect(result[0].expectedAmount).toBe(8500);
  });

  it('should set status RECEIVED when received date is present', () => {
    const result = parseNotionIncomes(INCOMES_CSV);
    expect(result[0].status).toBe('RECEIVED');
    expect(result[1].status).toBe('PENDING');
  });

  it('should parse dates in YYYY-MM-DD format', () => {
    const result = parseNotionIncomes(INCOMES_CSV);
    expect(result[0].expectedReceiptAt).toBe('2026-07-05');
    expect(result[0].receivedAt).toBe('2026-07-07');
    expect(result[1].receivedAt).toBeNull();
  });
});

describe('parseNotionGeneralExpenses', () => {
  it('should parse general expense rows', () => {
    const result = parseNotionGeneralExpenses(GENERAL_EXPENSES_CSV);
    expect(result).toHaveLength(2);
  });

  it('should map expense type and category names', () => {
    const result = parseNotionGeneralExpenses(GENERAL_EXPENSES_CSV);
    expect(result[0].expenseTypeName).toBe('Custos Fixos');
    expect(result[0].categoryName).toBe('Moradia');
  });

  it('should parse estimated and actual amounts', () => {
    const result = parseNotionGeneralExpenses(GENERAL_EXPENSES_CSV);
    expect(result[0].estimatedAmount).toBe(1800);
    expect(result[0].actualAmount).toBe(1800);
    expect(result[1].actualAmount).toBeNull();
  });

  it('should parse paid status', () => {
    const result = parseNotionGeneralExpenses(GENERAL_EXPENSES_CSV);
    expect(result[0].status).toBe('PAID');
    expect(result[1].status).toBe('PENDING');
  });
});

describe('parseNotionCurrentExpenses', () => {
  it('should parse current expense rows', () => {
    const result = parseNotionCurrentExpenses(CURRENT_EXPENSES_CSV);
    expect(result).toHaveLength(2);
  });

  it('should parse amount and date', () => {
    const result = parseNotionCurrentExpenses(CURRENT_EXPENSES_CSV);
    expect(result[0].amount).toBe(250.5);
    expect(result[0].paidAt).toBe('2026-07-03');
  });

  it('should map type and category names', () => {
    const result = parseNotionCurrentExpenses(CURRENT_EXPENSES_CSV);
    expect(result[0].expenseTypeName).toBe('Conforto');
    expect(result[0].categoryName).toBe('Alimentação');
  });
});

describe('parseNotionGoals', () => {
  it('should parse goal entry rows', () => {
    const result = parseNotionGoals(GOALS_CSV);
    expect(result).toHaveLength(3);
  });

  it('should extract year and month from text', () => {
    const result = parseNotionGoals(GOALS_CSV);
    expect(result[0].year).toBe(2026);
    expect(result[0].month).toBe(1);
    expect(result[1].month).toBe(2);
  });

  it('should parse planned and actual amounts', () => {
    const result = parseNotionGoals(GOALS_CSV);
    expect(result[0].plannedAmount).toBe(500);
    expect(result[0].actualAmount).toBe(500);
    expect(result[2].actualAmount).toBeNull();
  });
});
