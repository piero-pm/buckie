/** A RFC4122-v4 id using the platform crypto RNG. Client-generated so offline
 * creates get a stable id before sync. */
export function newId(): string {
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40 // version 4
  b[8] = (b[8] & 0x3f) | 0x80 // variant
  const h = (n: number) => n.toString(16).padStart(2, '0')
  return `${h(b[0])}${h(b[1])}${h(b[2])}${h(b[3])}-${h(b[4])}${h(b[5])}-${h(b[6])}${h(b[7])}-${h(b[8])}${h(b[9])}-${h(b[10])}${h(b[11])}${h(b[12])}${h(b[13])}${h(b[14])}${h(b[15])}`
}

/** Fixed record id for the single expectations record (WORK-005): one
 * record per user, upserted in place. */
export const EXPECTATIONS_ID = 'expectations'
