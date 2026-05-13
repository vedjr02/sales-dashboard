import type { LucideIcon } from 'lucide-react';
import {
  WandSparkles,
  LayoutDashboard,
  Users,
  Target,
  Handshake,
  LineChart,
  FileBarChart,
  UserSquare2,
  Settings,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navigationItems: NavItem[] = [
  { label: 'Import Center', href: '/import-center', icon: WandSparkles },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', href: '/leads', icon: Users },
  { label: 'Opportunities', href: '/opportunities', icon: Target },
  { label: 'Deals', href: '/deals', icon: Handshake },
  { label: 'Analytics', href: '/analytics', icon: LineChart },
  { label: 'Reports', href: '/reports', icon: FileBarChart },
  { label: 'Team', href: '/team', icon: UserSquare2 },
  { label: 'Settings', href: '/settings', icon: Settings },
];
