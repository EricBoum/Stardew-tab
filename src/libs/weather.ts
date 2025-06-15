import axios from 'axios'
import { useStorage } from './storage.ts'

export const byQWeather = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const {latitude, longitude} = position.coords
        try {
          const weatherRes = await axios.get(import.meta.env.VITE_QWEATHER_API, {
            params: {
              location: `${ longitude },${ latitude }`,
              key: import.meta.env.VITE_QWEATHER_KEY,
            },
          })
          const daily = weatherRes.data.daily
          const todayWeather = daily[0].textDay
          const tomorrowWeather = daily[1].textDay

          const returnData = {
            today: dealWithWeather(todayWeather),
            tomorrow: dealWithWeather(tomorrowWeather),
          }

          await setWeather(returnData)
          resolve(returnData)
        } catch (error) {
          reject(error)
        }
      },
      (err) => {
        reject(err)
      }
    )
  })
}

export function dealWithWeather(input: string): { zh: string; en: string } {
  const mapping: { keywords: string[]; zh: string; en: string }[] = [
    {keywords: [ '晴' ], zh: '晴', en: 'Sunny'},
    {keywords: [ '雨' ], zh: '雨', en: 'Rainy'},
    {keywords: [ '雷' ], zh: '雷', en: 'Stormy'},
    {keywords: [ '雪' ], zh: '雪', en: 'Snowy'},
    {keywords: [ '风' ], zh: '风', en: 'Windy'},
  ]

  for (const {keywords, en} of mapping) {
    if (keywords.some(keyword => new RegExp(keyword, 'i').test(input))) {
      return {zh: input, en}
    }
  }

  return {zh: input, en: 'Default'}
}

export const setWeather = async (data: any) => {
  const cached = {
    data,
    timestamp: Date.now()
  }
  await useStorage().setStorage('weather_cache', cached)
}

export const getWeatherData = async (): Promise<any> => {
  const cache = await useStorage().getStorage('weather_cache')
  if (cache) {
    try {
      const now = Date.now()
      // 五小时内最多请求一次，隔天可立即请求
      const FIVE_HOURS = 5 * 60 * 60 * 1000
      const nowDateStr = new Date(now).toDateString()
      const cacheDateStr = new Date(cache.timestamp).toDateString()
      const isSameDay = nowDateStr === cacheDateStr
      if (now - cache.timestamp < FIVE_HOURS && isSameDay) {
        return cache.data
      }
    } catch (e) {
      console.warn('解析缓存失败', e)
    }
  }
  return await byQWeather()
}
