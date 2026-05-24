import type { MailListMessage } from '@/components/MailList/types'
import zhCN from './zh-CN'
import zhTW from './zh-TW'
import en from './en'

const mailListMessageMap: Record<string, MailListMessage[]> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en
}

export const getMailListMessages = (locale: string): MailListMessage[] => {
  return mailListMessageMap[locale] || en
}
