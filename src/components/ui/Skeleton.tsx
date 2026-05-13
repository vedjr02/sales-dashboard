import React from 'react';

export function Skeleton({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`block animate-pulse rounded-md bg-slate-700/55 ${className}`}
      style={style}
      aria-hidden
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  const widths = ['w-full', 'w-[92%]', 'w-[80%]', 'w-[70%]'];
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={`h-3.5 ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}

export function SkeletonTable({
  columns,
  rows,
  showHeader = true,
}: {
  columns: number;
  rows: number;
  showHeader?: boolean;
}) {
  return (
    <div className="overflow-x-auto" role="status" aria-label="Loading table">
      <table className="min-w-full text-left">
        {showHeader ? (
          <thead>
            <tr>
              {Array.from({ length: columns }, (_, i) => (
                <th key={i} className="pb-3 pr-4">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r} className="border-t border-slate-700/30">
              {Array.from({ length: columns }, (_, c) => (
                <td key={c} className="py-3 pr-4">
                  <Skeleton className={`h-4 ${c === 0 ? 'w-36' : 'w-24'}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonStatGrid({ cells = 4 }: { cells?: number }) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      role="status"
      aria-label="Loading statistics"
    >
      {Array.from({ length: cells }, (_, i) => (
        <div key={i} className="rounded-xl border border-slate-700/40 bg-slate-900/25 p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-8 w-16" />
          <Skeleton className="mt-3 h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonPipelineRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading pipeline">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="mb-1 flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-14" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonActivityList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading activity">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-center rounded-xl border border-slate-700/40 bg-slate-900/25 px-4 py-3"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="ml-4 min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-[88%] max-w-md" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 300 }: { height?: number }) {
  const barHeightsPx = [110, 165, 95, 195, 130, 178, 118, 152, 102, 168, 142, 128];
  return (
    <div role="status" aria-label="Loading chart">
      <div className="mb-3 flex items-end justify-between gap-1.5 px-1" style={{ height }}>
        {barHeightsPx.map((px, i) => (
          <Skeleton
            key={i}
            className="min-w-[6px] flex-1 rounded-t-md"
            style={{ height: px }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between gap-2 border-t border-slate-700/30 pt-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-3 flex-1 max-w-[3rem]" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonKanban({ columns = 3, cardsPerColumn = 2 }: { columns?: number; cardsPerColumn?: number }) {
  return (
    <div
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Loading pipeline board"
    >
      {Array.from({ length: columns }, (_, c) => (
        <div key={c} className="rounded-xl border border-slate-700/40 bg-slate-900/20 p-4">
          <Skeleton className="mb-4 h-5 w-32" />
          <div className="space-y-3">
            {Array.from({ length: cardsPerColumn }, (_, k) => (
              <div key={k} className="rounded-xl border border-slate-700/35 bg-slate-900/35 p-3">
                <Skeleton className="h-4 w-[85%] max-w-[200px]" />
                <Skeleton className="mt-2 h-3 w-24" />
                <Skeleton className="mt-3 h-2 w-full rounded-full" />
                <Skeleton className="mt-2 h-3 w-28" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonSummaryLines({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-2.5" role="status" aria-label="Loading summary">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={`h-4 ${i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-[85%]' : 'w-[60%]'}`} />
      ))}
    </div>
  );
}

export function SkeletonPreviewTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto" role="status" aria-label="Loading preview">
      <table className="min-w-full text-left">
        <thead>
          <tr>
            {Array.from({ length: 5 }, (_, i) => (
              <th key={i} className="pb-2 pr-4">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r} className="border-t border-slate-700/35">
              {Array.from({ length: 5 }, (_, c) => (
                <td key={c} className="py-2 pr-4">
                  <Skeleton className="h-3.5 w-20" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonPills({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2" role="status" aria-label="Loading tags">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-7 w-[5.5rem] rounded-full" />
      ))}
    </div>
  );
}

export function SkeletonCardRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading list">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-xl border border-slate-700/40 bg-slate-900/25 p-3">
          <Skeleton className="h-4 w-44" />
        </div>
      ))}
    </div>
  );
}
