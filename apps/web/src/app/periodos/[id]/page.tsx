import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, TrendingUp, Receipt, ShoppingCart, BarChart3 } from 'lucide-react';
import { DeletePeriodButton } from '../../../components/features/delete-period-button';
import { periodsService } from '../../../services/periods.service';
import { incomesService } from '../../../services/incomes.service';
import { generalExpensesService } from '../../../services/general-expenses.service';
import { currentExpensesService } from '../../../services/current-expenses.service';
import { weeklyBalancesService } from '../../../services/weekly-balances.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));
}

function sumAmounts(items: { expectedAmount?: string; actualAmount?: string | null; amount?: string; estimatedAmount?: string }[]) {
  return items.reduce((acc, item) => {
    const value = Number(item.actualAmount ?? item.amount ?? item.expectedAmount ?? item.estimatedAmount ?? 0);
    return acc + value;
  }, 0);
}

type Props = { params: Promise<{ id: string }> };

export default async function PeriodDetailPage({ params }: Props) {
  const { id } = await params;

  try {
    const [period, incomes, generalExpenses, currentExpenses, weeklyBalances] = await Promise.all([
      periodsService.get(id),
      incomesService.list(id),
      generalExpensesService.list(id),
      currentExpensesService.list(id),
      weeklyBalancesService.list(id),
    ]);

    const totalIncome = sumAmounts(incomes);
    const totalGeneralExpenses = sumAmounts(generalExpenses);
    const totalCurrentExpenses = sumAmounts(currentExpenses);
    const totalExpenses = totalGeneralExpenses + totalCurrentExpenses;
    const balance = totalIncome - totalExpenses;

    return (
      <div className="flex flex-col gap-6 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/periodos">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">
              {MONTH_NAMES[period.month - 1]} {period.year}
            </h1>
          </div>
          <DeletePeriodButton
            periodId={period.id}
            periodLabel={`${MONTH_NAMES[period.month - 1]} ${period.year}`}
          />
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Gastos Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {formatCurrency(balance)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Balanços Semanais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{weeklyBalances.length}</p>
              <p className="text-xs text-muted-foreground">semanas registradas</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation to sub-sections */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href={`/periodos/${id}/receitas`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 py-5 px-5">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Receitas</p>
                  <p className="text-xs text-muted-foreground">{incomes.length} lançamento(s)</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/periodos/${id}/gastos-gerais`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 py-5 px-5">
                <Receipt className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Gastos Gerais</p>
                  <p className="text-xs text-muted-foreground">{generalExpenses.length} lançamento(s)</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/periodos/${id}/gastos-correntes`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 py-5 px-5">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Gastos Correntes</p>
                  <p className="text-xs text-muted-foreground">{currentExpenses.length} lançamento(s)</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/periodos/${id}/balanco-semanal`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center gap-3 py-5 px-5">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Balanço Semanal</p>
                  <p className="text-xs text-muted-foreground">{weeklyBalances.length} semana(s)</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent incomes */}
        {incomes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Receitas</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/periodos/${id}/receitas`}>Ver todas</Link>
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {incomes.slice(0, 3).map((income) => (
                <Card key={income.id}>
                  <CardContent className="flex items-center justify-between py-3 px-4">
                    <div>
                      <p className="font-medium">{income.name}</p>
                      <p className="text-xs text-muted-foreground">{income.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(income.actualAmount ?? income.expectedAmount)}
                      </p>
                      <Badge variant={income.status === 'RECEIVED' ? 'success' : 'warning'}>
                        {income.status === 'RECEIVED' ? 'Recebida' : 'Pendente'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch {
    notFound();
  }
}
