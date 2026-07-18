export type ImportEntityType = 'income' | 'general-expense' | 'current-expense';

export type ImportFieldKind =
  | 'text'
  | 'money'
  | 'date'
  | 'lookup-expense-type'
  | 'lookup-category'
  | 'lookup-payment-method'
  | 'lookup-status-income'
  | 'lookup-status-expense'
  | 'lookup-source';

export interface ImportFieldDef {
  key: string;
  label: string;
  required: boolean;
  kind: ImportFieldKind;
  synonyms: string[];
}

export const IMPORT_FIELD_DEFS: Record<ImportEntityType, ImportFieldDef[]> = {
  income: [
    { key: 'name', label: 'Nome', required: true, kind: 'text', synonyms: ['receita', 'nome', 'name', 'título', 'title'] },
    { key: 'category', label: 'Categoria', required: true, kind: 'text', synonyms: ['categoria', 'category'] },
    { key: 'source', label: 'Fonte', required: false, kind: 'lookup-source', synonyms: ['fonte', 'origem', 'source', 'banco'] },
    { key: 'expectedAmount', label: 'Valor previsto', required: true, kind: 'money', synonyms: ['valor', 'value', 'valor previsto', 'expected amount'] },
    { key: 'actualAmount', label: 'Valor recebido', required: false, kind: 'money', synonyms: ['valor recebido', 'actual amount', 'recebido'] },
    { key: 'expectedReceiptAt', label: 'Previsão de recebimento', required: false, kind: 'date', synonyms: ['previsão de recebimento', 'expected receipt', 'previsão'] },
    { key: 'receivedAt', label: 'Recebido em', required: false, kind: 'date', synonyms: ['recebido em', 'received at', 'data de recebimento'] },
    { key: 'status', label: 'Status', required: false, kind: 'lookup-status-income', synonyms: ['status'] },
    { key: 'notes', label: 'Notas', required: false, kind: 'text', synonyms: ['notas', 'observações', 'notes', 'obs'] },
  ],
  'general-expense': [
    { key: 'name', label: 'Nome', required: true, kind: 'text', synonyms: ['gasto', 'nome', 'name', 'título', 'title', 'despesa'] },
    { key: 'expenseType', label: 'Tipo de gasto', required: true, kind: 'lookup-expense-type', synonyms: ['tipo', 'type', 'tipo de gasto'] },
    { key: 'category', label: 'Categoria', required: true, kind: 'lookup-category', synonyms: ['categoria', 'category'] },
    { key: 'source', label: 'Fonte', required: false, kind: 'lookup-source', synonyms: ['fonte', 'origem', 'source'] },
    { key: 'estimatedAmount', label: 'Valor estimado', required: true, kind: 'money', synonyms: ['valor estimado', 'estimated', 'valor'] },
    { key: 'actualAmount', label: 'Valor pago', required: false, kind: 'money', synonyms: ['valor pago', 'actual', 'pago'] },
    { key: 'expectedPayAt', label: 'Pagar em', required: false, kind: 'date', synonyms: ['pagar em', 'vencimento', 'due date'] },
    { key: 'paidAt', label: 'Pago em', required: false, kind: 'date', synonyms: ['pago em', 'paid at', 'data de pagamento', 'quando', 'quando foi pago'] },
    { key: 'status', label: 'Status', required: false, kind: 'lookup-status-expense', synonyms: ['status'] },
    { key: 'paymentMethod', label: 'Forma de pagamento', required: false, kind: 'lookup-payment-method', synonyms: ['via de pagamento', 'forma de pagamento', 'payment method'] },
    { key: 'notes', label: 'Notas', required: false, kind: 'text', synonyms: ['notas', 'observações', 'notes'] },
  ],
  'current-expense': [
    { key: 'name', label: 'Nome', required: true, kind: 'text', synonyms: ['gasto', 'nome', 'name', 'título', 'title', 'despesa'] },
    { key: 'expenseType', label: 'Tipo de gasto', required: true, kind: 'lookup-expense-type', synonyms: ['tipo', 'type'] },
    { key: 'category', label: 'Categoria', required: true, kind: 'lookup-category', synonyms: ['categoria', 'category'] },
    { key: 'source', label: 'Fonte', required: false, kind: 'lookup-source', synonyms: ['fonte', 'origem', 'source'] },
    { key: 'amount', label: 'Valor', required: true, kind: 'money', synonyms: ['valor', 'value', 'amount'] },
    { key: 'paidAt', label: 'Quando foi pago', required: true, kind: 'date', synonyms: ['quando foi pago', 'data', 'date', 'paid at', 'pago em', 'quando'] },
    { key: 'paymentMethod', label: 'Forma de pagamento', required: true, kind: 'lookup-payment-method', synonyms: ['forma de pagamento', 'via de pagamento', 'payment method'] },
    { key: 'notes', label: 'Notas', required: false, kind: 'text', synonyms: ['notas', 'observações', 'notes'] },
  ],
};
