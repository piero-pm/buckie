import { useState, FormEvent } from 'react'
import { Button, Group, Select, Stack, Text, TextInput } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import {
  FREQUENCIES,
  FREQUENCY_LABELS,
  INCOME_KINDS,
  INCOME_LABELS,
  WEEKDAY_LABELS,
  validateIncomeSource,
  type Frequency,
  type IncomeKind,
  type IncomeSource,
} from '../domain/income'
import { newId } from '../domain/ids'

interface Props {
  onSave: (source: IncomeSource) => Promise<void>
  /** Optional back action; omitted inside onboarding (TICKET-021). */
  onBack?: () => void
  /** When set, the form edits this source instead of creating one. */
  source?: IncomeSource
  onCancelEdit?: () => void
}

/** Add/edit income form (IncomePage + onboarding). Validates BR-INC-1/2
 * + frequency fields; editing keeps id/dates/end state (BR-EDIT-1). */
export default function IncomeForm({
  onSave,
  onBack,
  source,
  onCancelEdit,
}: Props) {
  const editing = source !== undefined
  const [amount, setAmount] = useState(String(source?.amount ?? ''))
  const [kind, setKind] = useState<IncomeKind | ''>(source?.kind ?? '')
  const [label, setLabel] = useState(source?.label ?? '')
  const [day, setDay] = useState(String(source?.dayOfMonth ?? '1'))
  const [frequency, setFrequency] = useState<Frequency>(
    source?.frequency ?? 'monthly'
  )
  const [weekday, setWeekday] = useState(String(source?.payWeekday ?? '1'))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  /** Shared field values: weekly keeps a weekday, other frequencies a day. */
  function fieldValues() {
    return {
      amount: Number(amount),
      kind,
      label: label || undefined,
      dayOfMonth: day ? Number(day) : undefined,
      frequency,
      payWeekday: frequency === 'weekly' ? Number(weekday) : undefined,
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const result = validateIncomeSource(fieldValues())
    if (!result.ok) {
      setError(result.error)
      return
    }
    setBusy(true)
    try {
      await onSave({
        ...fieldValues(),
        kind: kind as IncomeKind,
        id: source?.id ?? newId(),
        active: source?.active ?? true,
        endedAt: source?.endedAt,
        createdAt: source?.createdAt ?? new Date().toISOString(),
      })
      if (!editing) resetFields()
    } catch {
      setError('Could not save. Try again.')
    } finally {
      setBusy(false)
    }
  }

  function resetFields() {
    setAmount('')
    setKind('')
    setLabel('')
    setDay('1')
    setFrequency('monthly')
    setWeekday('1')
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={editing ? 'edit income' : 'add income'}
    >
      <Stack gap="md">
        <Text size="sm" fw={600} c="gray.7">
          {editing ? 'Edit income source' : 'Add income source'}
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
          label="Amount"
          id="income-amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          leftSection={<span style={{ fontWeight: 600 }}>€</span>}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Select
          label="Frequency"
          id="income-frequency"
          data={FREQUENCIES.map((f) => ({
            value: f,
            label: FREQUENCY_LABELS[f],
          }))}
          value={frequency}
          onChange={(v) => setFrequency((v as Frequency) ?? 'monthly')}
        />
        {frequency === 'weekly' ? (
          <Select
            label="Paid on"
            id="income-weekday"
            data={WEEKDAY_LABELS.map((name, i) => ({
              value: String(i),
              label: name,
            }))}
            value={weekday}
            onChange={(v) => setWeekday(v ?? '1')}
          />
        ) : (
          <TextInput
            label="Day of month (optional)"
            id="income-day"
            type="number"
            min="1"
            max="31"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
        )}
        <TextInput
          label="Label (optional)"
          id="income-label"
          type="text"
          placeholder="e.g. Acme payroll"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        {editing ? (
          <Group grow>
            <Button variant="default" onClick={onCancelEdit}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              Save changes
            </Button>
          </Group>
        ) : (
          <Button type="submit" fullWidth loading={busy}>
            Add
          </Button>
        )}
        {onBack && !editing && (
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
