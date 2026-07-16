export const STATUS_COLORS = ['secondary', 'success', 'warning', 'destructive', 'info', 'purple'] as const;

export type StatusColor = (typeof STATUS_COLORS)[number];

export const DEFAULT_STATUS_COLOR: StatusColor = 'secondary';

export function isStatusColor(value: string): value is StatusColor {
  return (STATUS_COLORS as readonly string[]).includes(value);
}
