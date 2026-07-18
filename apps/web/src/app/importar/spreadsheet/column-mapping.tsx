'use client';

import { useLayoutEffect, useRef, useState, type JSX } from 'react';

import type { ImportFieldDef } from 'shared-types';

import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';

interface Line {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface ColumnMappingProps {
  headers: string[];
  fields: ImportFieldDef[];
  mapping: Record<string, string | null>;
  onChange: (mapping: Record<string, string | null>) => void;
}

export function ColumnMapping({ headers, fields, mapping, onChange }: ColumnMappingProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRefs = useRef(new Map<string, HTMLDivElement>());
  const fieldRefs = useRef(new Map<string, HTMLDivElement>());
  const [lines, setLines] = useState<Line[]>([]);
  const [draggingHeader, setDraggingHeader] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);

  const mappedHeaders = new Set(Object.values(mapping).filter((h): h is string => !!h));

  function recomputeLines(): void {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    const next: Line[] = [];
    for (const field of fields) {
      const header = mapping[field.key];
      if (!header) continue;
      const headerEl = headerRefs.current.get(header);
      const fieldEl = fieldRefs.current.get(field.key);
      if (!headerEl || !fieldEl) continue;

      const headerRect = headerEl.getBoundingClientRect();
      const fieldRect = fieldEl.getBoundingClientRect();

      next.push({
        key: field.key,
        x1: headerRect.right - containerRect.left,
        y1: headerRect.top + headerRect.height / 2 - containerRect.top,
        x2: fieldRect.left - containerRect.left,
        y2: fieldRect.top + fieldRect.height / 2 - containerRect.top,
      });
    }
    setLines(next);
  }

  useLayoutEffect(() => {
    recomputeLines();
    const onResize = (): void => recomputeLines();
    window.addEventListener('resize', onResize);
    const observer = new ResizeObserver(onResize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      window.removeEventListener('resize', onResize);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapping, headers, fields]);

  function connectHeaderToField(header: string, fieldKey: string): void {
    const next: Record<string, string | null> = { ...mapping };
    // Enforce 1:1: clear this header from any other field it was mapped to.
    for (const key of Object.keys(next)) {
      if (next[key] === header) next[key] = null;
    }
    next[fieldKey] = header;
    onChange(next);
  }

  function clearField(fieldKey: string): void {
    onChange({ ...mapping, [fieldKey]: null });
  }

  return (
    <div ref={containerRef} className="relative grid grid-cols-2 gap-8 sm:gap-16">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {lines.map((line) => (
          <path
            key={line.key}
            d={`M ${line.x1} ${line.y1} C ${line.x1 + 40} ${line.y1}, ${line.x2 - 40} ${line.y2}, ${line.x2} ${line.y2}`}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2}
            opacity={0.6}
          />
        ))}
      </svg>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Colunas do arquivo</p>
        {headers.map((header) => {
          const isMapped = mappedHeaders.has(header);
          return (
            <div
              key={header}
              ref={(el) => { if (el) headerRefs.current.set(header, el); }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', header);
                setDraggingHeader(header);
              }}
              onDragEnd={() => setDraggingHeader(null)}
              className={cn(
                'relative z-10 cursor-grab rounded-lg border px-3 py-2 text-sm shadow-sm active:cursor-grabbing',
                isMapped ? 'border-primary/40 bg-primary/5' : 'border-border bg-background',
              )}
            >
              {header}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Campos do sistema</p>
        {fields.map((field) => {
          const header = mapping[field.key];
          const isRequired = field.required;
          const isEmpty = !header;
          return (
            <div
              key={field.key}
              ref={(el) => { if (el) fieldRefs.current.set(field.key, el); }}
              onDragOver={(e) => { e.preventDefault(); setHoveredField(field.key); }}
              onDragLeave={() => setHoveredField((prev) => (prev === field.key ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                const header = e.dataTransfer.getData('text/plain') || draggingHeader;
                if (header) connectHeaderToField(header, field.key);
                setHoveredField(null);
                setDraggingHeader(null);
              }}
              className={cn(
                'relative z-10 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors',
                hoveredField === field.key ? 'border-primary bg-primary/10' : 'border-border bg-background',
                isEmpty && isRequired && 'border-destructive/50',
              )}
            >
              <span className="flex items-center gap-1.5">
                {field.label}
                {isRequired && <span className="text-destructive">*</span>}
              </span>
              {header ? (
                <span className="flex items-center gap-1.5">
                  <Badge variant="secondary">{header}</Badge>
                  <button
                    type="button"
                    onClick={() => clearField(field.key)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Remover mapeamento de ${field.label}`}
                  >
                    ×
                  </button>
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">arraste uma coluna aqui</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
