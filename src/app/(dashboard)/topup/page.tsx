import { redirect } from 'next/navigation';

/**
 * /topup is a legacy shortcut only ever linked from the dashboard
 * BalanceCard's "Top Up" pill. Deposits already have a full flow at
 * /deposit (M-Pesa, Airtel Money, card, bank) — this route exists so
 * that old link keeps working without maintaining a second, duplicate
 * deposit flow that would drift out of sync with the real one.
 */
export default function TopupPage() {
  redirect('/deposit');
}
