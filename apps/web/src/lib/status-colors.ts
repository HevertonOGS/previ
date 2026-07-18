import { STATUS_COLORS, DEFAULT_STATUS_COLOR, type StatusColor } from 'shared-types';

import type { BadgeProps } from '../components/ui/badge';

export { STATUS_COLORS, DEFAULT_STATUS_COLOR };
export type { StatusColor };

interface StatusColorMeta {
  label: string;
  badgeVariant: NonNullable<BadgeProps['variant']>;
  swatchClass: string;
  textClass: string;
}

const STATUS_COLOR_META: Record<StatusColor, StatusColorMeta> = {
  secondary: { label: 'Cinza', badgeVariant: 'secondary', swatchClass: 'bg-gray-400', textClass: 'text-foreground' },
  success: { label: 'Verde', badgeVariant: 'success', swatchClass: 'bg-green-500', textClass: 'text-green-600' },
  warning: { label: 'Amarelo', badgeVariant: 'warning', swatchClass: 'bg-yellow-500', textClass: 'text-yellow-600' },
  destructive: { label: 'Vermelho', badgeVariant: 'destructive', swatchClass: 'bg-red-500', textClass: 'text-red-500' },
  info: { label: 'Azul', badgeVariant: 'info', swatchClass: 'bg-blue-500', textClass: 'text-blue-600' },
  purple: { label: 'Roxo', badgeVariant: 'purple', swatchClass: 'bg-purple-500', textClass: 'text-purple-600' },
};

export function statusColorMeta(color: string | undefined | null): StatusColorMeta {
  if (color && color in STATUS_COLOR_META) return STATUS_COLOR_META[color as StatusColor];
  return STATUS_COLOR_META[DEFAULT_STATUS_COLOR];
}
