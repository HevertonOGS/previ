import { Test, TestingModule } from '@nestjs/testing';

import { GoalsImportService } from './goals-import.service';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { SpreadsheetImportService } from './spreadsheet-import.service';

describe('ImportController', () => {
  let controller: ImportController;

  const mockService = {
    parseStatement: jest.fn(),
    confirmImport: jest.fn(),
  };

  const mockSpreadsheetService = {
    parseFile: jest.fn(),
    confirm: jest.fn(),
  };

  const mockGoalsService = {
    parseFile: jest.fn(),
    confirm: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportController],
      providers: [
        { provide: ImportService, useValue: mockService },
        { provide: SpreadsheetImportService, useValue: mockSpreadsheetService },
        { provide: GoalsImportService, useValue: mockGoalsService },
      ],
    }).compile();

    controller = module.get<ImportController>(ImportController);
    jest.clearAllMocks();
  });

  describe('parseStatement', () => {
    it('should return parsed transactions from an OFX file', async () => {
      const mockTransactions = [
        { tempId: 'tmp-1', date: '2026-07-01', description: 'Mercado', amount: 150 },
      ];
      mockService.parseStatement.mockReturnValue(mockTransactions);

      const mockFile = { buffer: Buffer.from('<OFX>...</OFX>'), originalname: 'extrato.ofx' } as Express.Multer.File;
      const result = await controller.parseStatement(mockFile);

      expect(result).toEqual({ transactions: mockTransactions });
      expect(mockService.parseStatement).toHaveBeenCalledWith(mockFile.buffer, 'ofx');
    });

    it('should detect CSV from file extension', async () => {
      mockService.parseStatement.mockReturnValue([]);
      const mockFile = { buffer: Buffer.from('date,title,amount'), originalname: 'extrato.csv' } as Express.Multer.File;

      await controller.parseStatement(mockFile);

      expect(mockService.parseStatement).toHaveBeenCalledWith(mockFile.buffer, 'csv');
    });
  });

  describe('confirmStatement', () => {
    it('should confirm import and return count', async () => {
      mockService.confirmImport.mockResolvedValue({ created: 3 });

      const dto = {
        periodId: 'period-1',
        expenseTypeId: 'type-1',
        categoryId: 'cat-1',
        paymentMethod: 'DEBIT',
        transactions: [],
      };

      const result = await controller.confirmStatement(dto);

      expect(result).toEqual({ created: 3 });
      expect(mockService.confirmImport).toHaveBeenCalledWith(dto);
    });
  });

  describe('parseSpreadsheet', () => {
    it('should parse a spreadsheet CSV file and return headers, rows and a suggested mapping', () => {
      const mockResult = {
        headers: ['Gasto', 'Valor'],
        rows: [{ tempId: 'r-1', raw: { Gasto: 'Mercado', Valor: '150' } }],
        suggestedMapping: { name: 'Gasto', amount: 'Valor' },
      };
      mockSpreadsheetService.parseFile.mockReturnValue(mockResult);

      const mockFile = { buffer: Buffer.from('csv'), originalname: 'gastos.csv' } as Express.Multer.File;
      const result = controller.parseSpreadsheet(mockFile, 'current-expense');

      expect(result).toEqual(mockResult);
      expect(mockSpreadsheetService.parseFile).toHaveBeenCalledWith(mockFile.buffer, 'current-expense');
    });

    it('should reject an invalid entity type', () => {
      const mockFile = { buffer: Buffer.from('csv'), originalname: 'gastos.csv' } as Express.Multer.File;

      expect(() => controller.parseSpreadsheet(mockFile, 'unknown' as never)).toThrow();
    });
  });

  describe('confirmSpreadsheet', () => {
    it('should confirm the spreadsheet import and return created/skipped counts', async () => {
      mockSpreadsheetService.confirm.mockResolvedValue({
        created: 2,
        skipped: [{ tempId: 'r-3', missingFields: ['paidAt'] }],
      });

      const dto = {
        entityType: 'current-expense' as const,
        periodId: 'period-1',
        mapping: { name: 'Gasto' },
        rows: [],
      };

      const result = await controller.confirmSpreadsheet(dto);

      expect(result).toEqual({ created: 2, skipped: [{ tempId: 'r-3', missingFields: ['paidAt'] }] });
      expect(mockSpreadsheetService.confirm).toHaveBeenCalledWith(dto);
    });
  });

  describe('parseGoals', () => {
    it('should parse a goals CSV file and return rows', () => {
      const mockRows = [{ tempId: 'g-1', year: 2026, month: 1, plannedAmount: 500, actualAmount: null }];
      mockGoalsService.parseFile.mockReturnValue(mockRows);

      const mockFile = { buffer: Buffer.from('csv'), originalname: 'metas.csv' } as Express.Multer.File;
      const result = controller.parseGoals(mockFile);

      expect(result).toEqual({ rows: mockRows });
      expect(mockGoalsService.parseFile).toHaveBeenCalledWith(mockFile.buffer);
    });
  });

  describe('confirmGoals', () => {
    it('should confirm goal entries and return count', async () => {
      mockGoalsService.confirm.mockResolvedValue({ created: 3 });

      const dto = { goalId: 'goal-1', rows: [] };
      const result = await controller.confirmGoals(dto);

      expect(result).toEqual({ created: 3 });
      expect(mockGoalsService.confirm).toHaveBeenCalledWith(dto);
    });
  });
});
