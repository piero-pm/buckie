import { ActionIcon, Group, Select } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

interface Option {
  value: string
  label: string
}

/** Month select + prev/next arrows (BR-MTH-1, WORK-007): arrows step one
 * month, disabled at the data bounds (first data month, current month). */
export default function MonthStepper({
  options,
  selected,
  onSelect,
}: {
  options: Option[]
  selected: string
  onSelect: (month: string) => void
}) {
  const values = options.map((o) => o.value) // newest-first
  const first = values[values.length - 1]
  const last = values[0]
  const step = (delta: number) => {
    const next = values[values.indexOf(selected) - delta]
    if (next) onSelect(next)
  }
  return (
    <Group justify="space-between" align="flex-end" wrap="nowrap">
      <Select
        label="Month"
        id="month"
        data={options}
        value={selected}
        onChange={(v) => v && onSelect(v)}
        style={{ flex: 1 }}
      />
      <Group gap={4} pb={4}>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="previous month"
          disabled={selected === first}
          onClick={() => step(1)}
        >
          <IconChevronLeft size={16} />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="next month"
          disabled={selected === last}
          onClick={() => step(-1)}
        >
          <IconChevronRight size={16} />
        </ActionIcon>
      </Group>
    </Group>
  )
}
