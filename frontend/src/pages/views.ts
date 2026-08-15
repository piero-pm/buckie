/** Post-login views, owned by App so the persistent header and the pages
 * share one navigation state (BA-DS-005). Hub is the default view after
 * unlock. */
export type View =
  'hub' | 'capture' | 'expenses' | 'recurring' | 'dashboard' | 'help'
