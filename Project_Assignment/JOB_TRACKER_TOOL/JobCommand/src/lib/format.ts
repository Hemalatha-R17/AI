import type { Currency } from '../types';

export function formatSalary(amount: number | null, currency: Currency): string {
  if (amount === null || amount === undefined) return '—';
  if (currency === 'INR') {
    if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
    if (amount >= 100_000)   return `₹${(amount / 100_000).toFixed(1)}L`;
    if (amount >= 1_000)     return `₹${(amount / 1_000).toFixed(0)}k`;
    return `₹${amount}`;
  }
  const symbols: Partial<Record<Currency, string>> = {
    USD: '$', GBP: '£', EUR: '€', CAD: 'CA$', AUD: 'A$', SGD: 'S$',
  };
  const sym = symbols[currency] || '$';
  if (amount >= 1_000_000) return `${sym}${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)     return `${sym}${(amount / 1_000).toFixed(0)}k`;
  return `${sym}${amount}`;
}

export function formatSalaryRange(
  min: number | null, max: number | null, currency: Currency,
): string {
  if (min === null && max === null) return '—';
  if (min !== null && max !== null) return `${formatSalary(min, currency)}–${formatSalary(max, currency)}`;
  if (min !== null) return `${formatSalary(min, currency)}+`;
  return `Up to ${formatSalary(max, currency)}`;
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
