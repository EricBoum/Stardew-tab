import BaiduLogo from '@/assets/image/search-engine/baidu.png'
import GoogleLogo from '@/assets/image/search-engine/google.png'

export interface SEARCH_ITEM {
  name: string;
  url: string;
  logo: string;
}
export const SEARCH_ENGINES: SEARCH_ITEM[] = [
  {
    name: 'Baidu',
    url: 'https://www.baidu.com/s?wd=',
    logo: BaiduLogo
  },
  {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    logo: GoogleLogo
  }
]
