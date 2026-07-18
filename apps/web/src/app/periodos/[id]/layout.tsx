import type { JSX } from 'react';

import { Badge } from '../../../components/ui/badge';
import { periodsService } from '../../../services/periods.service';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default async function PeriodLayout({ children, params }: Props): Promise<JSX.Element> {
  const { id } = await params;

  let periodLabel: string | null = null;
  try {
    const period = await periodsService.get(id);
    periodLabel = `${MONTH_NAMES[period.month - 1]} ${period.year}`;
  } catch {
    // Period not found or API unavailable
  }

  return (
    <div className="flex flex-col h-full">
      {periodLabel && (
        <div className="flex items-center gap-2 border-b border-border px-8 py-2 bg-muted/30">
          <span className="text-xs text-muted-foreground">Período:</span>
          <Badge variant="secondary" className="text-xs">{periodLabel}</Badge>
        </div>
      )}
      {children}
    </div>
  );
}
