import { Test, TestingModule } from '@nestjs/testing';
import { ImportService } from './import.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ImportService', () => {
  let service: ImportService;

  const mockPrisma = {
    currentExpense: {
      createMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ImportService>(ImportService);
    jest.clearAllMocks();
  });

  describe('parseStatement', () => {
    it('should parse an OFX file and return transactions', () => {
      const ofxContent = `
        <OFX>
          <BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKTRANLIST>
            <STMTTRN>
              <TRNTYPE>DEBIT</TRNTYPE>
              <DTPOSTED>20260701000000</DTPOSTED>
              <TRNAMT>-100.00</TRNAMT>
              <MEMO>TEST DEBIT</MEMO>
            </STMTTRN>
          </BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1>
        </OFX>
      `;
      const buffer = Buffer.from(ofxContent, 'utf-8');

      const result = service.parseStatement(buffer, 'ofx');

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(100);
      expect(result[0].description).toBe('TEST DEBIT');
      expect(result[0].date).toBe('2026-07-01');
    });

    it('should parse a CSV file and return transactions', () => {
      const csvContent = `date,title,amount\n2026-07-01,Compra Teste,-99.90\n`;
      const buffer = Buffer.from(csvContent, 'utf-8');

      const result = service.parseStatement(buffer, 'csv');

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(99.9);
      expect(result[0].description).toBe('Compra Teste');
    });
  });

  describe('confirmImport', () => {
    it('should create CurrentExpense records for all confirmed transactions', async () => {
      mockPrisma.currentExpense.createMany.mockResolvedValue({ count: 2 });

      const dto = {
        periodId: 'period-1',
        expenseTypeId: 'type-1',
        categoryId: 'cat-1',
        paymentMethod: 'DEBIT',
        transactions: [
          { tempId: 'tmp-1', date: '2026-07-01', description: 'Mercado', amount: 150 },
          { tempId: 'tmp-2', date: '2026-07-03', description: 'iFood', amount: 50 },
        ],
      };

      const result = await service.confirmImport(dto);

      expect(result.created).toBe(2);
      expect(mockPrisma.currentExpense.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            periodId: 'period-1',
            expenseTypeId: 'type-1',
            categoryId: 'cat-1',
            name: 'Mercado',
            amount: 150,
            paymentMethod: 'DEBIT',
          }),
          expect.objectContaining({
            name: 'iFood',
            amount: 50,
          }),
        ],
      });
    });
  });
});
