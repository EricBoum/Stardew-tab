/**
 * 和风天气图标代码映射表
 * iconDay/iconNight: 和风天气返回的图标代码
 * iconKey: 对应本地图片资源 (Sunny/Rainy/Snowy/Stormy/Windy/Default)
 */

export interface WeatherInfo {
  iconKey: 'Sunny' | 'Rainy' | 'Snowy' | 'Stormy' | 'Windy' | 'Default'
}

export const WEATHER_ICON_MAP: Record<string, WeatherInfo> = {
  // ========== 晴天系列 ==========
  '100': { iconKey: 'Sunny' },
  '150': { iconKey: 'Sunny' },

  // ========== 多云系列 ==========
  '101': { iconKey: 'Default' },
  '102': { iconKey: 'Default' },
  '103': { iconKey: 'Sunny' },
  '104': { iconKey: 'Default' },
  '151': { iconKey: 'Default' },
  '152': { iconKey: 'Default' },
  '153': { iconKey: 'Sunny' },

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
  '313': { iconKey: 'Rainy' },
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
  '404': { iconKey: 'Snowy' },
  '405': { iconKey: 'Snowy' },
  '406': { iconKey: 'Snowy' },
  '407': { iconKey: 'Snowy' },
  '408': { iconKey: 'Snowy' },
  '409': { iconKey: 'Snowy' },
  '410': { iconKey: 'Snowy' },
  '456': { iconKey: 'Snowy' },
  '457': { iconKey: 'Snowy' },
  '499': { iconKey: 'Snowy' },

  // ========== 雾霾沙尘系列 ==========
  '500': { iconKey: 'Default' },
  '501': { iconKey: 'Default' },
  '502': { iconKey: 'Default' },
  '503': { iconKey: 'Windy' },
  '504': { iconKey: 'Windy' },
  '507': { iconKey: 'Windy' },
  '508': { iconKey: 'Windy' },
  '509': { iconKey: 'Default' },
  '510': { iconKey: 'Default' },
  '511': { iconKey: 'Default' },
  '512': { iconKey: 'Default' },
  '513': { iconKey: 'Default' },
  '514': { iconKey: 'Default' },
  '515': { iconKey: 'Default' },

  // ========== 其他 ==========
  '900': { iconKey: 'Sunny' },
  '901': { iconKey: 'Default' },
  '999': { iconKey: 'Default' }
}
