/**
 * 和风天气图标代码映射表
 * iconDay/iconNight: 和风天气返回的图标代码
 * iconKey: 对应本地图片资源 (Sunny/Rainy/Snowy/Stormy/Windy/Default)
 */

export interface WeatherInfo {
  'zh-CN': string
  'en': string
  'ja': string
  'ko': string
  'ru': string
  iconKey: 'Sunny' | 'Rainy' | 'Snowy' | 'Stormy' | 'Windy' | 'Default'
}

export const WEATHER_ICON_MAP: Record<string, WeatherInfo> = {
  // ========== 晴天系列 ==========
  '100': {
    'zh-CN': '晴',
    'en': 'Sunny',
    'ja': '晴れ',
    'ko': '맑음',
    'ru': 'Ясно',
    iconKey: 'Sunny'
  },
  '150': {
    'zh-CN': '晴',
    'en': 'Clear',
    'ja': '晴れ',
    'ko': '맑음',
    'ru': 'Ясно',
    iconKey: 'Sunny'
  },

  // ========== 多云系列 ==========
  '101': {
    'zh-CN': '多云',
    'en': 'Cloudy',
    'ja': '曇り',
    'ko': '흐림',
    'ru': 'Облачно',
    iconKey: 'Default'
  },
  '102': {
    'zh-CN': '少云',
    'en': 'Few Clouds',
    'ja': '薄曇り',
    'ko': '구름 조금',
    'ru': 'Малооблачно',
    iconKey: 'Default'
  },
  '103': {
    'zh-CN': '晴间多云',
    'en': 'Partly Cloudy',
    'ja': '晴れ時々曇り',
    'ko': '가끔 흐림',
    'ru': 'Переменная облачность',
    iconKey: 'Sunny'
  },
  '104': {
    'zh-CN': '阴',
    'en': 'Overcast',
    'ja': '曇天',
    'ko': '흐린 날씨',
    'ru': 'Пасмурно',
    iconKey: 'Default'
  },
  '151': {
    'zh-CN': '多云',
    'en': 'Cloudy',
    'ja': '曇り',
    'ko': '흐림',
    'ru': 'Облачно',
    iconKey: 'Default'
  },
  '152': {
    'zh-CN': '少云',
    'en': 'Few Clouds',
    'ja': '薄曇り',
    'ko': '구름 조금',
    'ru': 'Малооблачно',
    iconKey: 'Default'
  },
  '153': {
    'zh-CN': '晴间多云',
    'en': 'Partly Cloudy',
    'ja': '晴れ時々曇り',
    'ko': '가끔 흐림',
    'ru': 'Переменная облачность',
    iconKey: 'Sunny'
  },

  // ========== 雨系列 ==========
  '300': {
    'zh-CN': '阵雨',
    'en': 'Shower',
    'ja': 'にわか雨',
    'ko': '소나기',
    'ru': 'Ливень',
    iconKey: 'Rainy'
  },
  '301': {
    'zh-CN': '强阵雨',
    'en': 'Heavy Shower',
    'ja': '激しいにわか雨',
    'ko': '강한 소나기',
    'ru': 'Сильный ливень',
    iconKey: 'Rainy'
  },
  '302': {
    'zh-CN': '雷阵雨',
    'en': 'Thundershower',
    'ja': '雷雨',
    'ko': '뇌우',
    'ru': 'Гроза с дождем',
    iconKey: 'Stormy'
  },
  '303': {
    'zh-CN': '强雷阵雨',
    'en': 'Heavy Thunderstorm',
    'ja': '激しい雷雨',
    'ko': '강한 뇌우',
    'ru': 'Сильная гроза',
    iconKey: 'Stormy'
  },
  '304': {
    'zh-CN': '雷阵雨伴有冰雹',
    'en': 'Thunderstorm with Hail',
    'ja': '雹を伴う雷雨',
    'ko': '우박을 동반한 뇌우',
    'ru': 'Гроза с градом',
    iconKey: 'Stormy'
  },
  '305': {
    'zh-CN': '小雨',
    'en': 'Light Rain',
    'ja': '小雨',
    'ko': '약한 비',
    'ru': 'Небольшой дождь',
    iconKey: 'Rainy'
  },
  '306': {
    'zh-CN': '中雨',
    'en': 'Moderate Rain',
    'ja': '中雨',
    'ko': '보통 비',
    'ru': 'Умеренный дождь',
    iconKey: 'Rainy'
  },
  '307': {
    'zh-CN': '大雨',
    'en': 'Heavy Rain',
    'ja': '大雨',
    'ko': '많은 비',
    'ru': 'Сильный дождь',
    iconKey: 'Rainy'
  },
  '308': {
    'zh-CN': '极端降雨',
    'en': 'Extreme Rain',
    'ja': '豪雨',
    'ko': '폭우',
    'ru': 'Экстремальный дождь',
    iconKey: 'Rainy'
  },
  '309': {
    'zh-CN': '毛毛雨',
    'en': 'Drizzle',
    'ja': '霧雨',
    'ko': '이슬비',
    'ru': 'Морось',
    iconKey: 'Rainy'
  },
  '310': {
    'zh-CN': '暴雨',
    'en': 'Storm',
    'ja': '暴風雨',
    'ko': '폭풍우',
    'ru': 'Ливень',
    iconKey: 'Rainy'
  },
  '311': {
    'zh-CN': '大暴雨',
    'en': 'Heavy Storm',
    'ja': '大暴風雨',
    'ko': '큰 폭풍우',
    'ru': 'Сильный ливень',
    iconKey: 'Rainy'
  },
  '312': {
    'zh-CN': '特大暴雨',
    'en': 'Severe Storm',
    'ja': '特大暴風雨',
    'ko': '특대 폭풍우',
    'ru': 'Сильнейший ливень',
    iconKey: 'Rainy'
  },
  '313': {
    'zh-CN': '冻雨',
    'en': 'Freezing Rain',
    'ja': '凍雨',
    'ko': '어는 비',
    'ru': 'Ледяной дождь',
    iconKey: 'Rainy'
  },
  '314': {
    'zh-CN': '小到中雨',
    'en': 'Light to Moderate Rain',
    'ja': '小雨から中雨',
    'ko': '약한 비에서 보통 비',
    'ru': 'Слабый до умеренного дождя',
    iconKey: 'Rainy'
  },
  '315': {
    'zh-CN': '中到大雨',
    'en': 'Moderate to Heavy Rain',
    'ja': '中雨から大雨',
    'ko': '보통 비에서 많은 비',
    'ru': 'Умеренный до сильного дождя',
    iconKey: 'Rainy'
  },
  '316': {
    'zh-CN': '大到暴雨',
    'en': 'Heavy Rain to Storm',
    'ja': '大雨から暴風雨',
    'ko': '많은 비에서 폭풍우',
    'ru': 'Сильный дождь до ливня',
    iconKey: 'Rainy'
  },
  '317': {
    'zh-CN': '暴雨到大暴雨',
    'en': 'Storm to Heavy Storm',
    'ja': '暴風雨から大暴風雨',
    'ko': '폭풍우에서 큰 폭풍우',
    'ru': 'Ливень до сильного ливня',
    iconKey: 'Rainy'
  },
  '318': {
    'zh-CN': '大暴雨到特大暴雨',
    'en': 'Heavy to Severe Storm',
    'ja': '大暴風雨から特大暴風雨',
    'ko': '큰 폭풍우에서 특대 폭풍우',
    'ru': 'Сильный до сильнейшего ливня',
    iconKey: 'Rainy'
  },
  '399': {
    'zh-CN': '雨',
    'en': 'Rain',
    'ja': '雨',
    'ko': '비',
    'ru': 'Дождь',
    iconKey: 'Rainy'
  },
  '350': {
    'zh-CN': '阵雨',
    'en': 'Shower',
    'ja': 'にわか雨',
    'ko': '소나기',
    'ru': 'Ливень',
    iconKey: 'Rainy'
  },
  '351': {
    'zh-CN': '强阵雨',
    'en': 'Heavy Shower',
    'ja': '激しいにわか雨',
    'ko': '강한 소나기',
    'ru': 'Сильный ливень',
    iconKey: 'Rainy'
  },

  // ========== 雪系列 ==========
  '400': {
    'zh-CN': '小雪',
    'en': 'Light Snow',
    'ja': '小雪',
    'ko': '약한 눈',
    'ru': 'Небольшой снег',
    iconKey: 'Snowy'
  },
  '401': {
    'zh-CN': '中雪',
    'en': 'Moderate Snow',
    'ja': '中雪',
    'ko': '보통 눈',
    'ru': 'Умеренный снег',
    iconKey: 'Snowy'
  },
  '402': {
    'zh-CN': '大雪',
    'en': 'Heavy Snow',
    'ja': '大雪',
    'ko': '많은 눈',
    'ru': 'Сильный снег',
    iconKey: 'Snowy'
  },
  '403': {
    'zh-CN': '暴雪',
    'en': 'Snowstorm',
    'ja': '暴風雪',
    'ko': '눈보라',
    'ru': 'Метель',
    iconKey: 'Snowy'
  },
  '404': {
    'zh-CN': '雨夹雪',
    'en': 'Sleet',
    'ja': 'みぞれ',
    'ko': '진눈깨비',
    'ru': 'Мокрый снег',
    iconKey: 'Snowy'
  },
  '405': {
    'zh-CN': '雨雪天气',
    'en': 'Rain and Snow',
    'ja': '雨雪',
    'ko': '비와 눈',
    'ru': 'Дождь со снегом',
    iconKey: 'Snowy'
  },
  '406': {
    'zh-CN': '阵雨夹雪',
    'en': 'Shower with Snow',
    'ja': 'にわか雨と雪',
    'ko': '소나기와 눈',
    'ru': 'Ливень со снегом',
    iconKey: 'Snowy'
  },
  '407': {
    'zh-CN': '阵雪',
    'en': 'Snow Shower',
    'ja': 'にわか雪',
    'ko': '소낙눈',
    'ru': 'Снежный ливень',
    iconKey: 'Snowy'
  },
  '408': {
    'zh-CN': '小到中雪',
    'en': 'Light to Moderate Snow',
    'ja': '小雪から中雪',
    'ko': '약한 눈에서 보통 눈',
    'ru': 'Слабый до умеренного снега',
    iconKey: 'Snowy'
  },
  '409': {
    'zh-CN': '中到大雪',
    'en': 'Moderate to Heavy Snow',
    'ja': '中雪から大雪',
    'ko': '보통 눈에서 많은 눈',
    'ru': 'Умеренный до сильного снега',
    iconKey: 'Snowy'
  },
  '410': {
    'zh-CN': '大到暴雪',
    'en': 'Heavy Snow to Snowstorm',
    'ja': '大雪から暴風雪',
    'ko': '많은 눈에서 눈보라',
    'ru': 'Сильный снег до метели',
    iconKey: 'Snowy'
  },
  '456': {
    'zh-CN': '阵雨夹雪',
    'en': 'Shower with Snow',
    'ja': 'にわか雨と雪',
    'ko': '소나기와 눈',
    'ru': 'Ливень со снегом',
    iconKey: 'Snowy'
  },
  '457': {
    'zh-CN': '阵雪',
    'en': 'Snow Shower',
    'ja': 'にわか雪',
    'ko': '소낙눈',
    'ru': 'Снежный ливень',
    iconKey: 'Snowy'
  },
  '499': {
    'zh-CN': '雪',
    'en': 'Snow',
    'ja': '雪',
    'ko': '눈',
    'ru': 'Снег',
    iconKey: 'Snowy'
  },

  // ========== 雾霾沙尘系列 ==========
  '500': {
    'zh-CN': '薄雾',
    'en': 'Mist',
    'ja': 'かすみ',
    'ko': '안개',
    'ru': 'Дымка',
    iconKey: 'Default'
  },
  '501': {
    'zh-CN': '雾',
    'en': 'Fog',
    'ja': '霧',
    'ko': '안개',
    'ru': 'Туман',
    iconKey: 'Default'
  },
  '502': {
    'zh-CN': '霾',
    'en': 'Haze',
    'ja': 'スモッグ',
    'ko': '연무',
    'ru': 'Смог',
    iconKey: 'Default'
  },
  '503': {
    'zh-CN': '扬沙',
    'en': 'Sand',
    'ja': '砂ぼこり',
    'ko': '날리는 모래',
    'ru': 'Песок',
    iconKey: 'Windy'
  },
  '504': {
    'zh-CN': '浮尘',
    'en': 'Dust',
    'ja': 'ちり',
    'ko': '먼지',
    'ru': 'Пыль',
    iconKey: 'Windy'
  },
  '507': {
    'zh-CN': '沙尘暴',
    'en': 'Duststorm',
    'ja': '砂嵐',
    'ko': '황사',
    'ru': 'Песчаная буря',
    iconKey: 'Windy'
  },
  '508': {
    'zh-CN': '强沙尘暴',
    'en': 'Sandstorm',
    'ja': '強い砂嵐',
    'ko': '강한 황사',
    'ru': 'Сильная песчаная буря',
    iconKey: 'Windy'
  },
  '509': {
    'zh-CN': '浓雾',
    'en': 'Dense Fog',
    'ja': '濃霧',
    'ko': '짙은 안개',
    'ru': 'Густой туман',
    iconKey: 'Default'
  },
  '510': {
    'zh-CN': '强浓雾',
    'en': 'Strong Fog',
    'ja': '強い濃霧',
    'ko': '매우 짙은 안개',
    'ru': 'Очень густой туман',
    iconKey: 'Default'
  },
  '511': {
    'zh-CN': '中度霾',
    'en': 'Moderate Haze',
    'ja': '中度スモッグ',
    'ko': '보통 연무',
    'ru': 'Умеренный смог',
    iconKey: 'Default'
  },
  '512': {
    'zh-CN': '重度霾',
    'en': 'Heavy Haze',
    'ja': '重度スモッグ',
    'ko': '짙은 연무',
    'ru': 'Сильный смог',
    iconKey: 'Default'
  },
  '513': {
    'zh-CN': '严重霾',
    'en': 'Severe Haze',
    'ja': '深刻なスモッグ',
    'ko': '심각한 연무',
    'ru': 'Опасный смог',
    iconKey: 'Default'
  },
  '514': {
    'zh-CN': '大雾',
    'en': 'Heavy Fog',
    'ja': '大霧',
    'ko': '큰 안개',
    'ru': 'Сильный туман',
    iconKey: 'Default'
  },
  '515': {
    'zh-CN': '特强浓雾',
    'en': 'Extra Heavy Fog',
    'ja': '特強濃霧',
    'ko': '특급 짙은 안개',
    'ru': 'Сверхгустой туман',
    iconKey: 'Default'
  },

  // ========== 其他 ==========
  '900': {
    'zh-CN': '热',
    'en': 'Hot',
    'ja': '暑い',
    'ko': '더움',
    'ru': 'Жарко',
    iconKey: 'Sunny'
  },
  '901': {
    'zh-CN': '冷',
    'en': 'Cold',
    'ja': '寒い',
    'ko': '추움',
    'ru': 'Холодно',
    iconKey: 'Default'
  },
  '999': {
    'zh-CN': '未知',
    'en': 'Unknown',
    'ja': '不明',
    'ko': '알 수 없음',
    'ru': 'Неизвестно',
    iconKey: 'Default'
  }
}
