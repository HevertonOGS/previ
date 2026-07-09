import { parseOFX } from './ofx.parser';

const SAMPLE_OFX = `
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20260701000000[-3:BRT]</DTPOSTED>
            <TRNAMT>-150.00</TRNAMT>
            <MEMO>MERCADO LIVRE *COMPRA</MEMO>
          </STMTTRN>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20260703000000[-3:BRT]</DTPOSTED>
            <TRNAMT>-50.50</TRNAMT>
            <MEMO>IFOOD PEDIDO</MEMO>
          </STMTTRN>
          <STMTTRN>
            <TRNTYPE>CREDIT</TRNTYPE>
            <DTPOSTED>20260705000000[-3:BRT]</DTPOSTED>
            <TRNAMT>5000.00</TRNAMT>
            <MEMO>SALARIO</MEMO>
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>
`;

describe('parseOFX', () => {
  it('should parse debit transactions and skip credits', () => {
    const result = parseOFX(SAMPLE_OFX);

    expect(result).toHaveLength(2);
  });

  it('should extract date in YYYY-MM-DD format', () => {
    const result = parseOFX(SAMPLE_OFX);

    expect(result[0].date).toBe('2026-07-01');
    expect(result[1].date).toBe('2026-07-03');
  });

  it('should extract positive amounts', () => {
    const result = parseOFX(SAMPLE_OFX);

    expect(result[0].amount).toBe(150);
    expect(result[1].amount).toBe(50.5);
  });

  it('should extract description from MEMO', () => {
    const result = parseOFX(SAMPLE_OFX);

    expect(result[0].description).toBe('MERCADO LIVRE *COMPRA');
    expect(result[1].description).toBe('IFOOD PEDIDO');
  });

  it('should assign a unique tempId to each transaction', () => {
    const result = parseOFX(SAMPLE_OFX);

    expect(result[0].tempId).toBeTruthy();
    expect(result[1].tempId).toBeTruthy();
    expect(result[0].tempId).not.toBe(result[1].tempId);
  });

  it('should return empty array for content with no transactions', () => {
    const result = parseOFX('<OFX></OFX>');

    expect(result).toHaveLength(0);
  });
});
