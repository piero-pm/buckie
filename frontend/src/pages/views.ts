/** Post-login views, owned by the router (WORK-007) and shared with the
 * persistent header (BA-DS-005). Hub is the default view after unlock; the
 * month dashboard lives inside the hub scroll (BR-HOME-2). */
export type View =
  | 'hub'
  | 'capture'
  | 'expenses'
  | 'recurring'
  | 'income'
  | 'expected'
  | 'help'
  | 'settings'
