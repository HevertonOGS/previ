-- DropForeignKey
ALTER TABLE "CurrentExpense" DROP CONSTRAINT "CurrentExpense_periodId_fkey";

-- DropForeignKey
ALTER TABLE "GeneralExpense" DROP CONSTRAINT "GeneralExpense_periodId_fkey";

-- DropForeignKey
ALTER TABLE "Income" DROP CONSTRAINT "Income_periodId_fkey";

-- DropForeignKey
ALTER TABLE "WeeklyBalance" DROP CONSTRAINT "WeeklyBalance_periodId_fkey";

-- DropForeignKey
ALTER TABLE "WeeklyBalanceByCategoryItem" DROP CONSTRAINT "WeeklyBalanceByCategoryItem_weeklyBalanceId_fkey";

-- DropForeignKey
ALTER TABLE "WeeklyBalanceByTypeItem" DROP CONSTRAINT "WeeklyBalanceByTypeItem_weeklyBalanceId_fkey";

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralExpense" ADD CONSTRAINT "GeneralExpense_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentExpense" ADD CONSTRAINT "CurrentExpense_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyBalance" ADD CONSTRAINT "WeeklyBalance_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyBalanceByTypeItem" ADD CONSTRAINT "WeeklyBalanceByTypeItem_weeklyBalanceId_fkey" FOREIGN KEY ("weeklyBalanceId") REFERENCES "WeeklyBalance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyBalanceByCategoryItem" ADD CONSTRAINT "WeeklyBalanceByCategoryItem_weeklyBalanceId_fkey" FOREIGN KEY ("weeklyBalanceId") REFERENCES "WeeklyBalance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
