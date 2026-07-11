-- CreateEnum
CREATE TYPE "CategoryKind" AS ENUM ('INCOME', 'EXPENSE', 'BOTH');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "kind" "CategoryKind" NOT NULL DEFAULT 'EXPENSE';
