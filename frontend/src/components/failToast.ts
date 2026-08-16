import { notifications } from '@mantine/notifications'

/** List-action failure toast (BR-ERR-4, TICKET-025): end/delete failures
 * are visible instead of silent unhandled rejections. */
export function failToast(action: string) {
  notifications.show({
    message: `Could not ${action} — try again.`,
    color: 'red',
    autoClose: 3000,
  })
}
