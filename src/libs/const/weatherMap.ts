/**
 * 和风天气图标代码映射表
 * iconDay/iconNight: 和风天气返回的图标代码
 * iconKey: 对应本地图片资源
 */

export type WeatherIconKey =
  | 'Sunny'
  | 'Cloudy'
  | 'Overcast'
  | 'Rainy'
  | 'Stormy'
  | 'Sleet'
  | 'Snowy'
  | 'Foggy'
  | 'Hazy'
  | 'Dusty'
  | 'Windy'
  | 'Hot'
  | 'Cold'
  | 'Default'

export interface WeatherInfo {
  iconKey: WeatherIconKey
}

export const WEATHER_ICON_MAP: Record<string, WeatherInfo> = {
  // ========== 晴天系列 ==========
  '100': { iconKey: 'Sunny' },
  '150': { iconKey: 'Sunny' },

  // ========== 多云系列 ==========
  '101': { iconKey: 'Cloudy' },
  '102': { iconKey: 'Cloudy' },
  '103': { iconKey: 'Cloudy' },
  '104': { iconKey: 'Overcast' },
  '151': { iconKey: 'Cloudy' },
  '152': { iconKey: 'Cloudy' },
  '153': { iconKey: 'Cloudy' },

  // ========== 雨系列 ==========
  '300': { iconKey: 'Rainy' },
  '301': { iconKey: 'Rainy' },
  '302': { iconKey: 'Stormy' },
  '303': { iconKey: 'Stormy' },
  '304': { iconKey: 'Stormy' },
  '305': { iconKey: 'Rainy' },
  '306': { iconKey: 'Rainy' },
  '307': { iconKey: 'Rainy' },
  '308': { iconKey: 'Rainy' },
  '309': { iconKey: 'Rainy' },
  '310': { iconKey: 'Rainy' },
  '311': { iconKey: 'Rainy' },
  '312': { iconKey: 'Rainy' },
  '313': { iconKey: 'Sleet' },
  '314': { iconKey: 'Rainy' },
  '315': { iconKey: 'Rainy' },
  '316': { iconKey: 'Rainy' },
  '317': { iconKey: 'Rainy' },
  '318': { iconKey: 'Rainy' },
  '399': { iconKey: 'Rainy' },
  '350': { iconKey: 'Rainy' },
  '351': { iconKey: 'Rainy' },

  // ========== 雪系列 ==========
  '400': { iconKey: 'Snowy' },
  '401': { iconKey: 'Snowy' },
  '402': { iconKey: 'Snowy' },
  '403': { iconKey: 'Snowy' },
  '404': { iconKey: 'Sleet' },
  '405': { iconKey: 'Sleet' },
  '406': { iconKey: 'Sleet' },
  '407': { iconKey: 'Snowy' },
  '408': { iconKey: 'Snowy' },
  '409': { iconKey: 'Snowy' },
  '410': { iconKey: 'Snowy' },
  '456': { iconKey: 'Sleet' },
  '457': { iconKey: 'Snowy' },
  '499': { iconKey: 'Snowy' },

  // ========== 雾霾沙尘系列 ==========
  '500': { iconKey: 'Foggy' },
  '501': { iconKey: 'Foggy' },
  '502': { iconKey: 'Hazy' },
  '503': { iconKey: 'Dusty' },
  '504': { iconKey: 'Dusty' },
  '507': { iconKey: 'Dusty' },
  '508': { iconKey: 'Dusty' },
  '509': { iconKey: 'Foggy' },
  '510': { iconKey: 'Foggy' },
  '511': { iconKey: 'Hazy' },
  '512': { iconKey: 'Hazy' },
  '513': { iconKey: 'Hazy' },
  '514': { iconKey: 'Foggy' },
  '515': { iconKey: 'Foggy' },

  // ========== 其他 ==========
  '900': { iconKey: 'Hot' },
  '901': { iconKey: 'Cold' },
  '999': { iconKey: 'Default' }
}
