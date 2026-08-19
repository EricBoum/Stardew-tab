import DefaultEngin from '@/assets/image/search-engine/defaultEngin.png'
import BaiduLogo from '@/assets/image/search-engine/baidu.png'
import GoogleLogo from '@/assets/image/search-engine/google.png'
import BingLogo from '@/assets/image/search-engine/bing.png'
import DuckDuckGoLogo from '@/assets/image/search-engine/DuckDuckGo.png'
import YahooLogo from '@/assets/image/search-engine/Yahoo.png'
import YandexLogo from '@/assets/image/search-engine/Yandex.png'
import Spring from '@/assets/image/season/Spring.png'
import Summer from '@/assets/image/season/Summer.png'
import Fall from '@/assets/image/season/Fall.png'
import Winter from '@/assets/image/season/Winter.png'
import type { WeatherIconKey } from './weatherMap'
import type { SearchEngine } from './type'

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

// 内置引擎 logo 的稳定映射：种子引擎不持久化打包后的 hash URL，运行时按 key 解析
export const BUILTIN_ENGINE_LOGO_MAP: Record<string, string> = {
  Default: DefaultEngin,
  Baidu: BaiduLogo,
  Google: GoogleLogo,
  Bing: BingLogo,
  DuckDuckGo: DuckDuckGoLogo,
  Yahoo: YahooLogo,
  Yandex: YandexLogo
}

// 后续版本新增的预设引擎：已有用户升级时只追加缺失项，不恢复用户主动删除的旧预设
export const ADDITIONAL_SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'bing',
    name: 'Bing',
    searchUrl: 'https://www.bing.com/search?q=%s',
    suggestionProvider: 'google',
    iconSource: 'builtin',
    builtinLogoKey: 'Bing',
    isBuiltin: true,
    hidden: true
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    searchUrl: 'https://duckduckgo.com/?q=%s',
    suggestionProvider: 'auto',
    iconSource: 'builtin',
    builtinLogoKey: 'DuckDuckGo',
    isBuiltin: true,
    hidden: true
  },
  {
    id: 'yahoo',
    name: 'Yahoo',
    searchUrl: 'https://search.yahoo.com/search?p=%s',
    suggestionProvider: 'google',
    iconSource: 'builtin',
    builtinLogoKey: 'Yahoo',
    isBuiltin: true,
    hidden: true
  },
  {
    id: 'yandex',
    name: 'Yandex',
    searchUrl: 'https://yandex.com/search/?text=%s',
    suggestionProvider: 'google',
    iconSource: 'builtin',
    builtinLogoKey: 'Yandex',
    isBuiltin: true,
    hidden: true
  }
]

// 种子引擎：首次运行写入存储。Default 受保护（不可删除、走 chrome.search），其他引擎之后可增删改
export const SEED_SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'default',
    name: 'Default',
    searchUrl: '',
    suggestionProvider: 'auto',
    iconSource: 'builtin',
    builtinLogoKey: 'Default',
    isBuiltin: true,
    protected: true,
    kind: 'chromeSearch'
  },
  {
    id: 'baidu',
    name: 'Baidu',
    searchUrl: 'https://www.baidu.com/s?wd=%s',
    suggestionProvider: 'baidu',
    iconSource: 'builtin',
    builtinLogoKey: 'Baidu',
    isBuiltin: true
  },
  {
    id: 'google',
    name: 'Google',
    searchUrl: 'https://www.google.com/search?q=%s',
    suggestionProvider: 'google',
    iconSource: 'builtin',
    builtinLogoKey: 'Google',
    isBuiltin: true
  },
  ...ADDITIONAL_SEARCH_ENGINES
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
      iconKey: WeatherIconKey;
      weatherKey: string;
    };
    tomorrow: {
      iconKey: WeatherIconKey;
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
export const WEATHER_LOCATION_PROMPT_HIDDEN_KEY = 'WEATHER_LOCATION_PROMPT_HIDDEN'

export const SEARCH_ENGINE_LIST_KEY = 'SEARCH_ENGINE_LIST' // 搜索引擎列表缓存key
export const SEARCH_ENGINE_SELECTED_ID_KEY = 'SEARCH_ENGINE_SELECTED_ID' // 选中引擎id缓存key
export const LEGACY_ENGINE_KEY = 'engine' // 旧版整对象存储的引擎key（迁移用）
export const MAX_VISIBLE_SEARCH_ENGINE_NUM = 12 // 最多同时显示的搜索引擎数量

export const VERSION = '2.2.2' // 版本号
