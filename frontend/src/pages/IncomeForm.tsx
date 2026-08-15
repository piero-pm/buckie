import { useState, FormEvent } from 'react'
import { Button, Group, Select, Stack, Text, TextInput } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import {
  INCOME_KINDS,
  INCOME_LABELS,
  validateIncomeSource,
  type IncomeKind,
  type IncomeSource,
} from '../domain/income'
import { newId } from '../domain/ids'

interface Props {
  onSave: (source: IncomeSource) => Promise<void>
  /** Optional back action; omitted inside onboarding (TICKET-021). */
  onBack?: () => void
}

/** Add-income form (IncomePage + onboarding, TICKET-020/021). Validates
 * BR-INC-1/2 and creates a new active monthly source. */
export default function IncomeForm({ onSave, onBack }: Props) {
  const [amount, setAmount] = useState('')
  const [kind, setKind] = useState<IncomeKind | ''>('')
  const [label, setLabel] = useState('')
  const [day, setDay] = useState('1')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setError('')
    const result = validateIncomeSource({
      amount: Number(amount),
      kind,
      label: label || undefined,
      dayOfMonth: day ? Number(day) : undefined,
    })
    if (!result.ok) {
      setError(result.error)
      return
    }
    setBusy(true)
    try {
      await onSave({
        id: newId(),
        amount: Number(amount),
        kind: kind as IncomeKind,
        label: label || undefined,
        dayOfMonth: day ? Number(day) : undefined,
        active: true,
        createdAt: new Date().toISOString(),
      })
      setAmount('')
      setKind('')
      setLabel('')
      setDay('1')
    } catch {
      setError('Could not save. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleAdd} aria-label="add income">
      <Stack gap="md">
        <Text size="sm" fw={600} c="gray.7">
          Add income source
        </Text>
        <Select
          label="Kind"
          id="kind"
          placeholder="Choose…"
          data={INCOME_KINDS.map((k) => ({
            value: k,
            label: INCOME_LABELS[k],
          }))}
          value={kind}
          onChange={(v) => setKind((v as IncomeKind) ?? '')}
          required
        />
        <TextInput
          label="Monthly amount"
          id="income-amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          leftSection={<span style={{ fontWeight: 600 }}>€</span>}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <TextInput
          label="Label (optional)"
          id="income-label"
          type="text"
          placeholder="e.g. Acme payroll"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <TextInput
          label="Day of month (optional)"
          id="income-day"
          type="number"
          min="1"
          max="31"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />
        <Button type="submit" fullWidth loading={busy}>
          Add
        </Button>
        {onBack && (
          <Group justify="center">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              onClick={onBack}
            >
              Back
            </Button>
          </Group>
        )}
        {error && (
          <Text role="alert" c="red.7" size="sm">
            {error}
          </Text>
        )}
      </Stack>
    </form>
  )
}
