/**
 * Single source of truth for the main app navigation — used by both
 * BottomNav (mobile, horizontal) and Sidebar (tablet/desktop, vertical)
 * so the two can never drift out of sync with each other or with the
 * actual routes that exist.
 *
 * Admin is deliberately not included here — it's a separate,
 * internal-only destination, not part of the main nav.
 */

export interface NavItem {
  label: string;
  href: string;
  /** Matches Icons.<name> in components/ui/Icons.tsx */
  icon: 'Dashboard' | 'Send' | 'ArrowDownLeft' | 'ArrowUpRight' | 'History' | 'User';
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: 'Dashboard' },
  { label: 'Send', href: '/transfer', icon: 'Send' },
  { label: 'Deposit', href: '/deposit', icon: 'ArrowDownLeft' },
  { label: 'Payout', href: '/payout', icon: 'ArrowUpRight' },
  { label: 'Activity', href: '/transactions', icon: 'History' },
  { label: 'Profile', href: '/profile', icon: 'User' },
];

/** Given the current pathname, is this nav item the active one? */
export function isNavItemActive(pathname: string | null, item: NavItem): boolean {
  if (item.href === '/dashboard') return pathname === '/dashboard';
  return pathname === item.href || Boolean(pathname?.startsWith(`${item.href}/`));
}
