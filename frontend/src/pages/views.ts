/** Post-login views, owned by App so the persistent header and the pages
 * share one navigation state (BA-DS-005). Hub is the default view after
 * unlock; the month dashboard lives inside the hub scroll (BR-HOME-2). */
export type View =
  'hub' | 'capture' | 'expenses' | 'recurring' | 'income' | 'expected' | 'help'
