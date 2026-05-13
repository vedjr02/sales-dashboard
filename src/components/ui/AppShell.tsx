import React from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import { MobileNav } from '@/components/ui/MobileNav';
import { GlobalDataUploadButton } from '@/components/sales/GlobalDataUploadButton';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="ambient-orb left-[-120px] top-[-80px] h-64 w-64 bg-cyan-400" />
      <div className="ambient-orb right-[-120px] top-20 h-72 w-72 bg-violet-500" />
      <div className="ambient-orb bottom-[-160px] left-1/3 h-96 w-96 bg-teal-400" />
      <MobileNav />
      <div className="relative flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto px-4 pb-8 pt-4 md:px-8 md:pt-5">{children}</main>
      </div>
      <GlobalDataUploadButton />
    </div>
  );
}
