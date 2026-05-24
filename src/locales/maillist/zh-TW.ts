import { DEFAULT_MAIL_LIST_MESSAGE_ID, type MailListMessage } from '@/components/MailList/types'

const mailListMessages: MailListMessage[] = [
  {
    id: DEFAULT_MAIL_LIST_MESSAGE_ID,
    sender: 'Stardew Tab 開發組',
    date: '2026.05.22',
    subject: '站內信入口來了',
    summary: '信箱已經放在設定按鈕左邊。',
    content: '我們先把信箱放在設定按鈕左邊。以後版本更新、維護通知和一些小彩蛋，都會像農場來信一樣收在這裡。'
  },
  {
    id: 'mailbox-layout-2026-05-22',
    sender: 'Stardew Tab 開發組',
    date: '2026.05.22',
    subject: '郵件閱讀器改版',
    summary: '左側列表，右側預覽。',
    content: '站內信現在改成更接近主流信箱的閱讀佈局：左側保留公告列表，點擊某封信後，右側會顯示完整內容。'
  }
]

export default mailListMessages
