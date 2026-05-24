import { DEFAULT_MAIL_LIST_MESSAGE_ID, type MailListMessage } from '@/components/MailList/types'

const mailListMessages: MailListMessage[] = [
  {
    id: DEFAULT_MAIL_LIST_MESSAGE_ID,
    sender: 'Stardew Tab 开发组',
    date: '2026.05.22',
    subject: '站内信入口来了',
    summary: '邮箱已经放在设置按钮左边。',
    content: '我们先把邮箱放在设置按钮左边。以后版本更新、维护通知和一些小彩蛋，都会像农场来信一样收在这里。'
  },
  {
    id: 'mailbox-layout-2026-05-22',
    sender: 'Stardew Tab 开发组',
    date: '2026.05.22',
    subject: '邮件阅读器改版',
    summary: '左侧列表，右侧预览。',
    content: '站内信现在改成更接近主流邮箱的阅读布局：左侧保留公告列表，点击某封信后，右侧会显示完整内容。'
  }
]

export default mailListMessages
