import type { WeatherIconKey } from './weatherMap'

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
