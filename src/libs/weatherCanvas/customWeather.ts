import type { INFORMATION } from '@/libs/const'
import type { CustomWeatherIntensity } from '@/libs/const/type'
import type { WeatherIconKey } from '@/libs/const/weatherMap'

export interface CustomWeatherOption {
  iconKey: WeatherIconKey;
  weatherKey: string;
  labelKey: string;
}

export const CUSTOM_WEATHER_OPTIONS: CustomWeatherOption[] = [
  {iconKey: 'Sunny', weatherKey: '100', labelKey: 'settings.customWeatherSunny'},
  {iconKey: 'Rainy', weatherKey: '306', labelKey: 'settings.customWeatherRain'},
  {iconKey: 'Snowy', weatherKey: '401', labelKey: 'settings.customWeatherSnow'},
]

export const CUSTOM_WEATHER_INTENSITIES: CustomWeatherIntensity[] = ['light', 'medium', 'heavy', 'extreme']

export const getCustomWeatherOption = (iconKey: WeatherIconKey): CustomWeatherOption => {
  return CUSTOM_WEATHER_OPTIONS.find(item => item.iconKey === iconKey) || CUSTOM_WEATHER_OPTIONS[0]
}

export const createCustomTodayWeather = (iconKey: WeatherIconKey): INFORMATION['weather']['today'] => {
  const customWeather = getCustomWeatherOption(iconKey)
  return {
    iconKey: customWeather.iconKey,
    weatherKey: customWeather.weatherKey
  }
}
