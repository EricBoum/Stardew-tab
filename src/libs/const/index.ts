import DefaultEngin from '@/assets/image/search-engine/defaultEngin.png'
import BaiduLogo from '@/assets/image/search-engine/baidu.png'
import GoogleLogo from '@/assets/image/search-engine/google.png'
import Spring from '@/assets/image/season/Spring.png'
import Summer from '@/assets/image/season/Summer.png'
import Fall from '@/assets/image/season/Fall.png'
import Winter from '@/assets/image/season/Winter.png'

export interface SEARCH_ITEM {
  name: string;
  url?: string;
  logo: string;
}
export const SEARCH_ENGINES: SEARCH_ITEM[] = [
  {
    name: 'Default',
    logo: DefaultEngin
  },
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
    isNight: boolean;
  };
  weather: {
    today: {
      iconKey: 'Sunny' | 'Rainy' | 'Snowy' | 'Stormy' | 'Windy' | 'Default';
      weatherKey: string;
    };
    tomorrow: {
      iconKey: 'Sunny' | 'Rainy' | 'Snowy' | 'Stormy' | 'Windy' | 'Default';
      weatherKey: string;
    };
  }
}

export interface SEASON_ITEM {
  img: string;
}
export interface SEASON_TYPE {
  spring: SEASON_ITEM;
  summer: SEASON_ITEM;
  fall: SEASON_ITEM;
  winter: SEASON_ITEM;

  [key: string]: SEASON_ITEM;
}
export const SEASON: SEASON_TYPE = {
  spring: {
    img: Spring
  },
  summer: {
    img: Summer
  },
  fall: {
    img: Fall
  },
  winter: {
    img: Winter
  }
}


export const MAX_COMMON_NUM = 11 // 最大常用快捷链接数量
export const MAX_CURRENT_NUM = 24 // 当前tab快捷链接数量
export const COMMON_LINK_LIST_KEY: string = 'COMMON_LINK_LIST' // 常用快捷链接缓存key
export const LINK_LIST_KEY: string = 'LINK_LIST' // 快捷链接缓存key

export const SINGLE_LINK_TEXT_LENGTH = 3 // 单个链接显示文字长度

export const SYSTEM_SETTING_KEY = 'SYSTEM_SETTING' //

export const VERSION = '1.3.0' // 版本号
