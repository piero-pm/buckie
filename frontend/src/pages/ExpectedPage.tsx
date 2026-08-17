import { Button, Group } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconArrowLeft } from '@tabler/icons-react'
import ExpectationsForm from '../components/ExpectationsForm'
import type { Expectations } from '../domain/expectations'
import PageShell from '../components/PageShell'

interface Props {
  initial: Expectations | null
  onSave: (e: Expectations) => Promise<void>
  onBack: () => void
}

/** Expected view (BR-EXP-SET-2, TICKET-037): edit the starting balance and
 * the six expected buckets anytime from the top bar; changes apply to the
 * comparison immediately (the workspace state is shared). */
export default function ExpectedPage({ initial, onSave, onBack }: Props) {
  return (
    <PageShell
      title="Expected amounts"
      subtitle="Your plan for the month — edit anytime; the month view compares it against what actually happens."
    >
      <ExpectationsForm
        initial={initial}
        requireCore={false}
        onSave={async (e) => {
          await onSave(e)
          notifications.show({
            message: 'Expected amounts saved.',
            color: 'green',
            autoClose: 2000,
          })
        }}
      />
      <Group justify="center" mt="md">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size={16} />}
          onClick={onBack}
        >
          Back
        </Button>
      </Group>
    </PageShell>
  )
}
