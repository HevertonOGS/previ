-- Convert Income.status from enum to text, preserving values in Portuguese
ALTER TABLE "Income" ALTER COLUMN "status" TYPE TEXT USING (
  CASE "status"::TEXT
    WHEN 'PENDING'  THEN 'Pendente'
    WHEN 'RECEIVED' THEN 'Recebida'
    ELSE "status"::TEXT
  END
);
ALTER TABLE "Income" ALTER COLUMN "status" SET DEFAULT 'Pendente';

-- Convert GeneralExpense.status from enum to text
ALTER TABLE "GeneralExpense" ALTER COLUMN "status" TYPE TEXT USING (
  CASE "status"::TEXT
    WHEN 'ESTIMATED' THEN 'Estimado'
    WHEN 'PENDING'   THEN 'Pendente'
    WHEN 'PAID'      THEN 'Pago'
    ELSE "status"::TEXT
  END
);
ALTER TABLE "GeneralExpense" ALTER COLUMN "status" SET DEFAULT 'Estimado';

-- Convert GeneralExpense.paymentMethod from enum to text (nullable)
ALTER TABLE "GeneralExpense" ALTER COLUMN "paymentMethod" TYPE TEXT USING (
  CASE "paymentMethod"::TEXT
    WHEN 'DEBIT'    THEN 'Débito'
    WHEN 'CREDIT'   THEN 'Crédito'
    WHEN 'PIX'      THEN 'PIX'
    WHEN 'CASH'     THEN 'Dinheiro'
    WHEN 'BENEFITS' THEN 'Benefícios'
    WHEN 'OTHER'    THEN 'Outro'
    ELSE "paymentMethod"::TEXT
  END
);

-- Convert CurrentExpense.paymentMethod from enum to text (not nullable)
ALTER TABLE "CurrentExpense" ALTER COLUMN "paymentMethod" TYPE TEXT USING (
  CASE "paymentMethod"::TEXT
    WHEN 'DEBIT'    THEN 'Débito'
    WHEN 'CREDIT'   THEN 'Crédito'
    WHEN 'PIX'      THEN 'PIX'
    WHEN 'CASH'     THEN 'Dinheiro'
    WHEN 'BENEFITS' THEN 'Benefícios'
    WHEN 'OTHER'    THEN 'Outro'
    ELSE "paymentMethod"::TEXT
  END
);

-- Drop old enums
DROP TYPE IF EXISTS "IncomeStatus";
DROP TYPE IF EXISTS "ExpenseStatus";
DROP TYPE IF EXISTS "PaymentMethod";

-- Add source field to incomes and expenses
ALTER TABLE "Income"          ADD COLUMN "source" TEXT;
ALTER TABLE "GeneralExpense"  ADD COLUMN "source" TEXT;
ALTER TABLE "CurrentExpense"  ADD COLUMN "source" TEXT;

-- Create option tables
CREATE TABLE "IncomeStatusOption" (
  "id"        TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IncomeStatusOption_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "IncomeStatusOption_name_key" ON "IncomeStatusOption"("name");

CREATE TABLE "ExpenseStatusOption" (
  "id"        TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ExpenseStatusOption_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ExpenseStatusOption_name_key" ON "ExpenseStatusOption"("name");

CREATE TABLE "PaymentMethodOption" (
  "id"        TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentMethodOption_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PaymentMethodOption_name_key" ON "PaymentMethodOption"("name");

-- Seed default options
INSERT INTO "IncomeStatusOption" ("id", "name") VALUES
  (gen_random_uuid()::TEXT, 'Pendente'),
  (gen_random_uuid()::TEXT, 'Recebida');

INSERT INTO "ExpenseStatusOption" ("id", "name") VALUES
  (gen_random_uuid()::TEXT, 'Estimado'),
  (gen_random_uuid()::TEXT, 'Pendente'),
  (gen_random_uuid()::TEXT, 'Pago');

INSERT INTO "PaymentMethodOption" ("id", "name") VALUES
  (gen_random_uuid()::TEXT, 'Débito'),
  (gen_random_uuid()::TEXT, 'Crédito'),
  (gen_random_uuid()::TEXT, 'PIX'),
  (gen_random_uuid()::TEXT, 'Dinheiro'),
  (gen_random_uuid()::TEXT, 'Benefícios'),
  (gen_random_uuid()::TEXT, 'Flash'),
  (gen_random_uuid()::TEXT, 'Outro');
