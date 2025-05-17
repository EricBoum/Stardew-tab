import BaiduLogo from '@/assets/image/search-engine/baidu.png'
import GoogleLogo from '@/assets/image/search-engine/google.png'
import Spring from '@/assets/image/season/Spring.png'
import Summer from '@/assets/image/season/Summer.png'
import Fall from '@/assets/image/season/Fall.png'
import Winter from '@/assets/image/season/Winter.png'


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

export interface INFORMATION {
  season: string;
  week: string;
  time: {
    hour: number | string;
    minute: number | string;
    second: number | string;
  };
  weather: {
    today: {
      zh: string;
      en: string;
    };
    tomorrow: {
      zh: string;
      en: string;
    };
  }
}

export const WEEK_LIST: string[] = [
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六'
]

export const SEASON: { [key: string]: string } = {
  spring: Spring,
  summer: Summer,
  fall: Fall,
  winter: Winter
}


