/**
 * Stable color assignments (BR-VI-8/13, WORK-008): a category keeps its
 * color in every view and every month, and buckets (trend lines) likewise.
 * Colors extend the BA-DS-013 anchors with ramp intermediates so the 16
 * categories stay pairwise distinguishable without a legend.
 */
import type { Bucket } from '../domain/taxonomy'

export const BUCKET_COLORS: Record<Bucket, string> = {
  Fixed: '#8F3B15',
  Everyday: '#BB4E1F',
  Social: '#E08E4F',
  Lifestyle: '#6B6055',
}

export const CATEGORY_COLORS: Record<string, string> = {
  Rent: '#6B2E10',
  Bills: '#D06324',
  Insurance: '#6B6055',
  Groceries: '#BB4E1F',
  'Transport & Travel': '#3F5A44',
  Health: '#E08E4F',
  'Personal care': '#8F3B15',
  Pets: '#8FB59A',
  'Restaurants & drinks': '#A8511F',
  'Entertainment & culture': '#D9BC8F',
  Gifts: '#C4632B',
  'Family & kids': '#2A231C',
  'Shopping & clothes': '#E8A366',
  Subscriptions: '#C9A16B',
  'Education & books': '#6B9C74',
  Miscellaneous: '#9C8B74',
  // Soft-legacy values (BR-TAX-3) inherit their successor's color.
  Food: '#BB4E1F',
  'Entertainment & Subscriptions': '#D9BC8F',
  Gift: '#C4632B',
  'Family & Kids': '#2A231C',
  Shopping: '#E8A366',
  'Education & Books': '#6B9C74',
}

/** Color for any stored category string; unknowns get a warm neutral. */
export function categoryColor(name: string): string {
  return CATEGORY_COLORS[name] ?? '#9C8B74'
}
