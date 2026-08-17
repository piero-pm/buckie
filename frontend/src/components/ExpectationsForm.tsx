import { useState, FormEvent } from 'react'
import { Button, Stack, Text, TextInput } from '@mantine/core'
import {
  EXPECTED_FIELDS,
  EXPECTED_LABELS,
  toExpectations,
  validateExpectations,
  type Expectations,
  type ExpectedAmounts,
} from '../domain/expectations'

interface Props {
  initial?: Expectations | null
  /** Onboarding requires the core three (BR-EXP-SET-2); edit mode does not. */
  requireCore: boolean
  onSave: (e: Expectations) => Promise<void>
}

const CORE: (keyof ExpectedAmounts)[] = ['groceries', 'goingOut', 'shopping']

/** Balance + expected monthly amounts (BR-EXP-SET-1/2, TICKET-037). Shared
 * by onboarding stage 3 and the Expected view so both stay identical. */
export default function ExpectationsForm({
  initial,
  requireCore,
  onSave,
}: Props) {
  const [balance, setBalance] = useState(
    initial ? String(initial.startingBalance) : ''
  )
  const [amounts, setAmounts] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {}
    for (const key of EXPECTED_FIELDS) {
      out[key] = initial?.expected[key] ? String(initial.expected[key]) : ''
    }
    return out
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const parsed = (v: string) => (v === '' ? undefined : Number(v))
    if (requireCore) {
      for (const key of CORE) {
        if (parsed(amounts[key]) === undefined) {
          setError(`${EXPECTED_LABELS[key]} is required (or skip this step).`)
          return
        }
      }
    }
    const record = toExpectations(Number(balance), {
      rent: parsed(amounts.rent),
      bills: parsed(amounts.bills),
      groceries: parsed(amounts.groceries),
      goingOut: parsed(amounts.goingOut),
      shopping: parsed(amounts.shopping),
      subscriptions: parsed(amounts.subscriptions),
    })
    const problem = validateExpectations(record)
    if (problem) {
      setError(problem)
      return
    }
    setBusy(true)
    try {
      await onSave(record)
    } catch {
      setError('Could not save. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="expected amounts">
      <Stack gap="sm">
        <Text size="sm" c="gray.6">
          Your plan: one-off balance plus what you expect to spend per month.
          Rent, bills and subscriptions are your own figures — nothing is
          derived automatically.
        </Text>
        <TextInput
          label="Starting bank balance"
          id="starting-balance"
          type="number"
          step="0.01"
          inputMode="decimal"
          placeholder="e.g. 1500"
          leftSection={<span style={{ fontWeight: 600 }}>€</span>}
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          required
        />
        {EXPECTED_FIELDS.map((key) => (
          <TextInput
            key={key}
            label={`Expected ${EXPECTED_LABELS[key].toLowerCase()}`}
            id={`expected-${key}`}
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="per month"
            leftSection={<span style={{ fontWeight: 600 }}>€</span>}
            value={amounts[key]}
            onChange={(e) => setAmounts({ ...amounts, [key]: e.target.value })}
            required={requireCore && CORE.includes(key)}
          />
        ))}
        {error && (
          <Text role="alert" c="red.7" size="sm">
            {error}
          </Text>
        )}
        <Button type="submit" fullWidth loading={busy}>
          Save expected amounts
        </Button>
      </Stack>
    </form>
  )
}
