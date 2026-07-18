import { parseGoalEntries } from './goals.parser';

const GOALS_CSV = `mês;valor previsto;valor efetivamente guardado
Janeiro 2026;500,00;500,00
Fevereiro 2026;500,00;300,00
Março 2026;500,00;
`;

describe('parseGoalEntries', () => {
  it('should parse goal entry rows', () => {
    const result = parseGoalEntries(GOALS_CSV);
    expect(result).toHaveLength(3);
  });

  it('should extract year and month from text', () => {
    const result = parseGoalEntries(GOALS_CSV);
    expect(result[0].year).toBe(2026);
    expect(result[0].month).toBe(1);
    expect(result[1].month).toBe(2);
  });

  it('should parse planned and actual amounts', () => {
    const result = parseGoalEntries(GOALS_CSV);
    expect(result[0].plannedAmount).toBe(500);
    expect(result[0].actualAmount).toBe(500);
    expect(result[2].actualAmount).toBeNull();
  });
});
