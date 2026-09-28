import type { StripeCardElementOptions } from '@stripe/stripe-js';
import type { Theme } from './theme';

/**
 * Stripe Elements render inside an iframe, so they can't read our CSS
 * variables — the text and placeholder colors have to be passed in as
 * literal values, matching the current theme's on-surface and
 * on-surface-variant.
 */
export function stripeCardStyle(theme: Theme): NonNullable<StripeCardElementOptions['style']> {
  return theme === 'dark'
    ? { base: { fontSize: '14px', color: '#ece9e2', '::placeholder': { color: '#b5b3ab' } } }
    : { base: { fontSize: '14px', color: '#14151a', '::placeholder': { color: '#5c5d63' } } };
}
