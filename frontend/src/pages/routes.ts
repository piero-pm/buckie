import type { View } from './views'

/** URL path per workspace view (BR-ROUTE-1, WORK-007). Clean paths, not
 * hash routing — the Go server falls back to index.html for unknowns. */
export const VIEW_PATHS: Record<View, string> = {
  hub: '/home',
  capture: '/capture',
  expenses: '/expenses',
  recurring: '/recurring',
  income: '/income',
  expected: '/expected',
  help: '/help',
  settings: '/settings',
}

/** Inverse map: the view owning a path, or null outside the workspace. */
export function viewFromPath(pathname: string): View | null {
  const entry = (Object.keys(VIEW_PATHS) as View[]).find(
    (v) => VIEW_PATHS[v] === pathname
  )
  return entry ?? null
}
