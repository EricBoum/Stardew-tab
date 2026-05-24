export const DEFAULT_MAIL_LIST_MESSAGE_ID = 'welcome-mailbox-2026-05-22'

export interface MailListMessage {
  id: string;
  sender: string;
  date: string;
  subject: string;
  summary: string;
  content: string;
}
