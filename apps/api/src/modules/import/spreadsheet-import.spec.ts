import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';

import { SpreadsheetImportService } from './spreadsheet-import.service';

describe('SpreadsheetImportService', () => {
  let service: SpreadsheetImportService;

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function lookupDelegate(existing: { id: string; name: string }[] = []) {
    const created: { id: string; name: string }[] = [];
    return {
      findMany: jest.fn(async ({ where: { name: { in: names } } }: { where: { name: { in: string[] } } }) => {
        const pool = [...existing, ...created];
        return pool.filter((e) => names.some((n) => n.toLowerCase() === e.name.toLowerCase()));
      }),
      createMany: jest.fn(async ({ data }: { data: { name: string }[] }) => {
        for (const d of data) created.push({ id: `new-${d.name}`, name: d.name });
        return { count: data.length };
      }),
    };
  }

  const mockPrisma = {
    expenseType: lookupDelegate([{ id: 'et-1', name: 'Alimentação' }]),
    category: lookupDelegate([{ id: 'cat-1', name: 'Mercado' }]),
    paymentMethodOption: lookupDelegate([{ id: 'pm-1', name: 'Débito' }]),
    incomeStatusOption: lookupDelegate([{ id: 'is-1', name: 'Pendente' }]),
    expenseStatusOption: lookupDelegate([{ id: 'es-1', name: 'Estimado' }]),
    sourceOption: lookupDelegate([{ id: 'src-1', name: 'Nubank' }]),
    currentExpense: { createMany: jest.fn(async ({ data }: { data: unknown[] }) => ({ count: data.length })) },
    generalExpense: { createMany: jest.fn(async ({ data }: { data: unknown[] }) => ({ count: data.length })) },
    income: { createMany: jest.fn(async ({ data }: { data: unknown[] }) => ({ count: data.length })) },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpreadsheetImportService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SpreadsheetImportService>(SpreadsheetImportService);
    jest.clearAllMocks();
  });

  describe('parseFile', () => {
    it('should parse a CSV buffer for the given entity type', () => {
      const buffer = Buffer.from('Gasto,Tipo,Categoria,Quando,Valor,Forma de pagamento\nMercado,Alimentação,Mercado,15/07/2026,350.90,Débito\n');

      const result = service.parseFile(buffer, 'current-expense');

      expect(result.headers).toContain('Gasto');
      expect(result.rows).toHaveLength(1);
      expect(result.suggestedMapping.name).toBe('Gasto');
    });
  });

  describe('confirm', () => {
    const mapping = {
      name: 'Gasto',
      expenseType: 'Tipo',
      category: 'Categoria',
      paidAt: 'Quando',
      amount: 'Valor',
      paymentMethod: 'Forma de pagamento',
    };

    it('should link rows to existing lookups and create records', async () => {
      const dto = {
        entityType: 'current-expense' as const,
        periodId: 'period-1',
        mapping,
        rows: [
          {
            tempId: 'row-1',
            raw: { Gasto: 'Supermercado', Tipo: 'Alimentação', Categoria: 'Mercado', Quando: '15/07/2026', Valor: '350.90', 'Forma de pagamento': 'Débito' },
          },
        ],
      };

      const result = await service.confirm(dto);

      expect(result.created).toBe(1);
      expect(result.skipped).toEqual([]);
      expect(mockPrisma.currentExpense.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            periodId: 'period-1',
            name: 'Supermercado',
            expenseTypeId: 'et-1',
            categoryId: 'cat-1',
            amount: 350.9,
            paymentMethod: 'Débito',
          }),
        ],
      });
    });

    it('should auto-create lookups that do not exist yet', async () => {
      const dto = {
        entityType: 'current-expense' as const,
        periodId: 'period-1',
        mapping,
        rows: [
          {
            tempId: 'row-1',
            raw: { Gasto: 'Cinema', Tipo: 'Lazer', Categoria: 'Lazer', Quando: '16/07/2026', Valor: '60.00', 'Forma de pagamento': 'Vale Cultura' },
          },
        ],
      };

      const result = await service.confirm(dto);

      expect(result.created).toBe(1);
      expect(mockPrisma.expenseType.createMany).toHaveBeenCalledWith({ data: [{ name: 'Lazer' }], skipDuplicates: true });
      expect(mockPrisma.category.createMany).toHaveBeenCalledWith({ data: [{ name: 'Lazer' }], skipDuplicates: true });
      expect(mockPrisma.paymentMethodOption.createMany).toHaveBeenCalledWith({ data: [{ name: 'Vale Cultura' }], skipDuplicates: true });
      expect(mockPrisma.currentExpense.createMany).toHaveBeenCalledWith({
        data: [expect.objectContaining({ expenseTypeId: 'new-Lazer', categoryId: 'new-Lazer', paymentMethod: 'Vale Cultura' })],
      });
    });

    it('should skip rows missing a required field and report their tempId', async () => {
      const dto = {
        entityType: 'current-expense' as const,
        periodId: 'period-1',
        mapping,
        rows: [
          {
            tempId: 'row-missing-date',
            raw: { Gasto: 'Ingresso', Tipo: 'Lazer', Categoria: 'Lazer', Quando: '', Valor: '45.00', 'Forma de pagamento': 'Vale Cultura' },
          },
        ],
      };

      const result = await service.confirm(dto);

      expect(result.created).toBe(0);
      expect(result.skipped).toEqual([{ tempId: 'row-missing-date', missingFields: ['paidAt'] }]);
      expect(mockPrisma.currentExpense.createMany).not.toHaveBeenCalled();
    });

    it('should store resolved payment method as a plain string, not an id', async () => {
      const dto = {
        entityType: 'current-expense' as const,
        periodId: 'period-1',
        mapping,
        rows: [
          {
            tempId: 'row-1',
            raw: { Gasto: 'Mercado', Tipo: 'Alimentação', Categoria: 'Mercado', Quando: '15/07/2026', Valor: '10.00', 'Forma de pagamento': 'débito' },
          },
        ],
      };

      await service.confirm(dto);

      expect(mockPrisma.currentExpense.createMany).toHaveBeenCalledWith({
        data: [expect.objectContaining({ paymentMethod: 'Débito' })],
      });
    });

    it('should handle income rows, keeping category as free text and resolving status by name', async () => {
      const dto = {
        entityType: 'income' as const,
        periodId: 'period-1',
        mapping: { name: 'Receita', category: 'Categoria', expectedAmount: 'Valor', status: 'Status' },
        rows: [
          { tempId: 'row-1', raw: { Receita: 'Salário', Categoria: 'Salário', Valor: '8500,00', Status: 'Pendente' } },
        ],
      };

      const result = await service.confirm(dto);

      expect(result.created).toBe(1);
      expect(mockPrisma.category.createMany).not.toHaveBeenCalled();
      expect(mockPrisma.income.createMany).toHaveBeenCalledWith({
        data: [expect.objectContaining({ category: 'Salário', status: 'Pendente', expectedAmount: 8500 })],
      });
    });
  });
});
