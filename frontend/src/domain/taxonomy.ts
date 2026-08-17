/**
 * Fixed category taxonomy (BR-TAX-2, WORK-005): 16 everyday categories in
 * four buckets. Groceries and restaurants are separated (need vs social) and
 * "Entertainment & Subscriptions" is split the same way. Legacy values stored
 * by the pre-split taxonomy stay valid for old records (BR-TAX-3) but are not
 * offered for new capture; edits migrate them naturally.
 */
export const BUCKETS = ['Fixed', 'Everyday', 'Social', 'Lifestyle'] as const
export type Bucket = (typeof BUCKETS)[number]

export const CATEGORIES = [
  'Rent',
  'Bills',
  'Insurance',
  'Groceries',
  'Transport & Travel',
  'Health',
  'Personal care',
  'Pets',
  'Restaurants & drinks',
  'Entertainment & culture',
  'Gifts',
  'Family & kids',
  'Shopping & clothes',
  'Subscriptions',
  'Education & books',
  'Miscellaneous',
] as const

export type Category = (typeof CATEGORIES)[number]

/** Stored values from the pre-split taxonomy (BR-TAX-3, soft legacy). */
export const LEGACY_CATEGORIES = [
  'Food',
  'Entertainment & Subscriptions',
  'Gift',
  'Family & Kids',
  'Shopping',
  'Education & Books',
] as const
export type LegacyCategory = (typeof LEGACY_CATEGORIES)[number]

const BUCKET_OF: Record<Category | LegacyCategory, Bucket> = {
  Rent: 'Fixed',
  Bills: 'Fixed',
  Insurance: 'Fixed',
  Groceries: 'Everyday',
  'Transport & Travel': 'Everyday',
  Health: 'Everyday',
  'Personal care': 'Everyday',
  Pets: 'Everyday',
  'Restaurants & drinks': 'Social',
  'Entertainment & culture': 'Social',
  Gifts: 'Social',
  'Family & kids': 'Social',
  'Shopping & clothes': 'Lifestyle',
  Subscriptions: 'Lifestyle',
  'Education & books': 'Lifestyle',
  Miscellaneous: 'Lifestyle',
  Food: 'Everyday', // legacy: food mixed groceries and restaurants
  'Entertainment & Subscriptions': 'Social', // legacy: mixed social + subs
  Gift: 'Social',
  'Family & Kids': 'Social',
  Shopping: 'Lifestyle',
  'Education & Books': 'Lifestyle',
}

/** Bucket of a stored category; unknown strings fall back to Lifestyle. */
export function bucketFor(category: string): Bucket {
  return BUCKET_OF[category as Category | LegacyCategory] ?? 'Lifestyle'
}

/** The 16 categories grouped for capture's grouped select. */
export function categoriesByBucket(): {
  group: Bucket
  items: Category[]
}[] {
  return BUCKETS.map((group) => ({
    group,
    items: CATEGORIES.filter((c) => bucketFor(c) === group),
  }))
}

/** Select data for editing an existing record: the 16 plus a Legacy group
 * containing the record's own legacy value (and siblings), so old records
 * render and re-save without forcing a re-tag (BR-TAX-3). */
export function editableCategories(current: string): {
  group: string
  items: string[]
}[] {
  const groups = categoriesByBucket() as { group: string; items: string[] }[]
  if ((LEGACY_CATEGORIES as readonly string[]).includes(current)) {
    return [...groups, { group: 'Legacy', items: [...LEGACY_CATEGORIES] }]
  }
  return groups
}

/** Phase-1 display currency (BR-DQ-2, approved 2026-08-11: EUR). */
export const CURRENCY = 'EUR'
const CURRENCY_SYMBOL = '€'

/** Formats an amount in EUR for display. */
export function formatEUR(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`
}
