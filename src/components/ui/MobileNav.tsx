'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { navigationItems } from '@/config/navigation';

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-700/40 bg-slate-950/90 px-4 py-3 backdrop-blur-md md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2 text-slate-100">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-200">
          <LayoutDashboard className="h-4 w-4" />
        </span>
        <span className="font-semibold tracking-tight">SalesDash</span>
      </Link>
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-600/70 text-slate-100 hover:bg-slate-800/50"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open ? (
        <div className="fixed inset-0 top-[52px] z-40 flex flex-col bg-slate-950/98 p-4 pb-8">
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors
                    ${isActive ? 'bg-cyan-500/15 text-cyan-100' : 'text-slate-200 hover:bg-slate-800/50'}
                  `}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60">
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
