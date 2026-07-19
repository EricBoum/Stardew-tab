import type { WeatherIconKey } from './weatherMap'

// 搜索引擎联想词来源：auto=按浏览器语言自动选、baidu/google=强制指定、none=关闭
export type SuggestionProvider = 'auto' | 'baidu' | 'google' | 'none'
// 引擎图标来源：builtin=内置 logo（按 key 运行时解析）、favicon=站点图标、upload=本地上传
export type EngineIconSource = 'builtin' | 'favicon' | 'upload'

export interface SearchEngine {
  id: string;                       // 稳定标识，选中态/存储/迁移都用它
  name: string;                     // 展示名（可改）
  searchUrl: string;                // 'https://x.com/s?q=%s'，无 %s 则末尾追加关键词
  suggestionProvider: SuggestionProvider;
  iconSource: EngineIconSource;
  builtinLogoKey?: string;          // iconSource==='builtin' 时按此 key 运行时解析内置 logo
  logo?: string;                    // iconSource==='favicon' 时的外链图标 URL
  iconId?: string;                  // iconSource==='favicon'|'upload' 时 IndexedDB 图标仓储 id
  isBuiltin?: boolean;              // 内置种子引擎标记
  protected?: boolean;              // 仅 Default：不可删除
  kind?: 'chromeSearch';            // 仅 Default：走 chrome.search.query
}

export type WeatherDisplayMode = 'real' | 'custom'
export type CustomWeatherIntensity = 'light' | 'medium' | 'heavy' | 'extreme'
export type ThemeMode = 'auto' | 'day' | 'night'
export type SearchOpenMode = 'newTab' | 'currentTab'

export interface LINK_ITEM_TYPE {
  parentId?: string | number;
  id?: string | number;
  name: string;
  url: string;
  logo: string;
  iconId?: string;
  builtinIconKey?: string;
  iconSource?: 'favicon' | 'text' | 'upload' | 'builtin';
  desc?: string;
  type: 'img' | 'text';
  bgColor?: string;
  textColor?: string;
}

export interface TAB_ITEM {
  name: string;
  id: string | number;
  list?: LINK_ITEM_TYPE[];
}

export interface SYSTEM_SETTING {
  language: string;
  bottomLinkShow: boolean;
  batteryShow: boolean;
  themeMode: ThemeMode;
  searchOpenMode: SearchOpenMode;
  weatherDisplayMode: WeatherDisplayMode;
  customWeatherIconKey: WeatherIconKey;
  customWeatherIntensity: CustomWeatherIntensity;
}
