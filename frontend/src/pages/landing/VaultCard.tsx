import { useEffect, useRef, useState } from 'react'
import { Box, Group, Stack, Text } from '@mantine/core'
import { useReducedMotion } from '@mantine/hooks'
import { IconLock } from '@tabler/icons-react'

const ENTRIES = ['Coffee · 4.50', 'Groceries · 62.10', 'Rent · 850.00']
const HEX = '0123456789abcdef'
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const randHex = (len: number) =>
  Array.from(
    { length: len },
    () => HEX[Math.floor(Math.random() * HEX.length)]
  ).join('')

type Row = { display: string; encrypted: boolean }

/** Types one plain-text entry char by char; resolves false if cancelled. */
async function typeEntry(
  text: string,
  alive: () => boolean,
  onStep: (shown: string) => void
): Promise<boolean> {
  let shown = ''
  for (const ch of text) {
    shown += ch
    onStep(shown)
    await sleep(42)
    if (!alive()) return false
  }
  return true
}

/** Scrambles an entry into ciphertext-looking hex; resolves false if
 * cancelled mid-way. */
async function scrambleEntry(
  alive: () => boolean,
  onStep: (hex: string, done: boolean) => void
): Promise<boolean> {
  for (let step = 0; step < 9; step++) {
    onStep(randHex(18), false)
    await sleep(35)
    if (!alive()) return false
  }
  onStep(randHex(18) + '…', true)
  return true
}

/** Hero "vault card" (BR-VI-2): types sample expenses, then visibly
 * scrambles them to ciphertext so "encrypted in your browser" is shown,
 * not claimed. Decorative (aria-hidden); prefers-reduced-motion renders
 * the encrypted end state with no timers. */
export default function VaultCard() {
  const reduced = useReducedMotion()
  const [rows, setRows] = useState<Row[]>([])
  const [status, setStatus] = useState('')
  const [visible, setVisible] = useState(true)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    if (reduced) {
      setRows(
        ENTRIES.map(() => ({ display: randHex(18) + '…', encrypted: true }))
      )
      setStatus('encrypted · only you hold the key')
      return
    }
    void runDemo(alive, setRows, setStatus, setVisible)
    return () => {
      alive.current = false
    }
  }, [reduced])

  return (
    <Box
      aria-hidden="true"
      w="100%"
      style={{
        background: 'var(--vault-bg)',
        borderRadius: 10,
        padding: '22px 22px 20px',
        boxShadow: '0 24px 60px -20px rgba(42,35,28,0.45)',
        minHeight: 270,
      }}
    >
      <Group
        gap={9}
        pb={14}
        mb={16}
        style={{ borderBottom: '1px solid var(--vault-line)' }}
      >
        <Box
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--vault-amber)',
          }}
        />
        <Text
          ff="var(--font-mono)"
          fz="0.74rem"
          lts="0.04em"
          c="var(--vault-text)"
          opacity={0.6}
          flex={1}
        >
          your-vault.local
        </Text>
        <IconLock size={13} color="var(--vault-amber)" opacity={0.8} />
      </Group>
      <Stack
        gap={12}
        style={{
          minHeight: 96,
          opacity: visible ? 1 : 0,
          transition: 'opacity .4s ease',
        }}
      >
        {rows.map((row, i) => (
          <Text
            key={i}
            ff="var(--font-mono)"
            fz="0.86rem"
            c={row.encrypted ? 'var(--vault-green-soft)' : 'var(--vault-text)'}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: row.encrypted ? '0.02em' : undefined,
            }}
          >
            {row.display}
            {!row.encrypted && <span className="vault-cursor" />}
          </Text>
        ))}
      </Stack>
      <Text
        mt={16}
        pt={14}
        ff="var(--font-mono)"
        fz="0.72rem"
        lts="0.03em"
        c="var(--vault-amber)"
        style={{ borderTop: '1px solid var(--vault-line)', minHeight: '1.2em' }}
      >
        {status || '\u00A0'}
      </Text>
    </Box>
  )
}

/** The type → scramble loop (concept mockup script, ported to state). */
async function runDemo(
  alive: { current: boolean },
  setRows: (rows: Row[]) => void,
  setStatus: (s: string) => void,
  setVisible: (v: boolean) => void
): Promise<void> {
  const ok = () => alive.current
  while (ok()) {
    const current: Row[] = []
    const commit = () => setRows([...current])
    current.length = 0
    commit()
    setStatus('')
    setVisible(true)
    for (const entry of ENTRIES) {
      const i = current.length
      current.push({ display: '', encrypted: false })
      commit()
      if (
        !(await typeEntry(entry, ok, (shown) => {
          current[i] = { display: shown, encrypted: false }
          commit()
        }))
      )
        return
      await sleep(260)
      if (!ok()) return
      setStatus('encrypting locally…')
      if (
        !(await scrambleEntry(ok, (hex, done) => {
          current[i] = { display: hex, encrypted: done }
          commit()
        }))
      )
        return
      setStatus('stored as ciphertext')
      await sleep(380)
      if (!ok()) return
    }
    setStatus('only you hold the key')
    await sleep(2000)
    if (!ok()) return
    setVisible(false)
    await sleep(400)
  }
}
