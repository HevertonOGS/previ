'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Target,
  Upload,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/periodos', label: 'Períodos', icon: CalendarDays },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/importar', label: 'Importar', icon: Upload },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <span className="text-lg font-semibold tracking-tight">Previ</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-sidebar-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
