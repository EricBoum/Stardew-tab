import { DEFAULT_MAIL_LIST_MESSAGE_ID, type MailListMessage } from '@/components/MailList/types'

const mailListMessages: MailListMessage[] = [
  {
    id: DEFAULT_MAIL_LIST_MESSAGE_ID,
    sender: 'Stardew Tab Team',
    date: '2026.05.22',
    subject: 'The mailbox is here',
    summary: 'The mailbox now lives beside Settings.',
    content: 'The mailbox now lives beside Settings. Future updates, maintenance notes, and small surprises can arrive here like letters to the farm.'
  },
  {
    id: 'mailbox-layout-2026-05-22',
    sender: 'Stardew Tab Team',
    date: '2026.05.22',
    subject: 'Mailbox layout update',
    summary: 'List on the left, preview on the right.',
    content: 'Mailbox announcements now use a familiar reader layout: the list stays on the left, and the selected letter opens in the preview area on the right.'
  }
]

export default mailListMessages
