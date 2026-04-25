'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Target,
  Handshake,
  LineChart,
  FileBarChart,
  UserSquare2,
  Settings,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Opportunities', href: '/opportunities', icon: Target },
  { label: 'Deals', href: '/deals', icon: Handshake },
  { label: 'Analytics', href: '/analytics', icon: LineChart },
  { label: 'Reports', href: '/reports', icon: FileBarChart },
  { label: 'Team', href: '/team', icon: UserSquare2 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass hidden w-72 min-h-screen flex-col border-r border-slate-700/30 md:flex">
      {/* Logo */}
      <div className="border-b border-slate-700/40 p-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-100">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-200">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          SalesDash
        </h1>
        <p className="mt-1 text-sm text-slate-400">Sales Intelligence Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200
                ${isActive
                  ? 'glow-ring bg-cyan-500/15 text-cyan-100'
                  : 'text-slate-300 hover:bg-slate-800/40 hover:text-slate-100'
                }
              `}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/40">
                <Icon className="h-4 w-4" />
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-700/40 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/25 text-cyan-100">
            <span className="text-sm font-bold">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-100">John Doe</p>
            <p className="truncate text-xs text-slate-400">Sales Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
