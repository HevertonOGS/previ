import { Test, TestingModule } from '@nestjs/testing';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { NotionImportService } from './notion-import.service';

describe('ImportController', () => {
  let controller: ImportController;

  const mockService = {
    parseStatement: jest.fn(),
    confirmImport: jest.fn(),
  };

  const mockNotionService = {
    parseFile: jest.fn(),
    confirmIncomes: jest.fn(),
    confirmGeneralExpenses: jest.fn(),
    confirmCurrentExpenses: jest.fn(),
    confirmGoals: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportController],
      providers: [
        { provide: ImportService, useValue: mockService },
        { provide: NotionImportService, useValue: mockNotionService },
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

  describe('parseNotion', () => {
    it('should parse a Notion CSV file and return rows', async () => {
      const mockRows = [{ tempId: 'r-1', name: 'Salário', category: 'Salário', expectedAmount: 8500, status: 'RECEIVED' }];
      mockNotionService.parseFile.mockReturnValue(mockRows);

      const mockFile = { buffer: Buffer.from('csv'), originalname: 'receitas.csv' } as Express.Multer.File;
      const result = await controller.parseNotion(mockFile, 'incomes');

      expect(result).toEqual({ rows: mockRows });
      expect(mockNotionService.parseFile).toHaveBeenCalledWith(mockFile.buffer, 'incomes');
    });
  });
});
