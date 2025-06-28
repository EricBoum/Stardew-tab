import axios from 'axios'
import { useStorage } from './storage.ts'

/**
 * 通过 ipapi.co 获取经纬度
 */
async function getCoordsByIP(): Promise<{ latitude: number; longitude: number }> {
  const {data} = await axios.get('https://ipapi.co/json/')
  return {latitude: data.latitude, longitude: data.longitude}
}

/**
 * 获取经纬度，优先使用浏览器定位，失败时使用 IP 定位兜底
 */
async function getCoords(): Promise<{ latitude: number, longitude: number }> {
  return new Promise((resolve, reject) => {
    // 1️⃣ 浏览器不支持 Geolocation：直接走 IP 兜底
    if (!( 'geolocation' in navigator )) {
      getCoordsByIP().then(resolve).catch(reject)
      return
    }

    // 2️⃣ 尝试浏览器定位；把可能的同步异常也收进 fallback
    try {
      navigator.geolocation.getCurrentPosition(
        pos => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
        },
        async err => {
          console.warn('Geolocation error → fallback by IP', err)
          try {
            const coords = await getCoordsByIP()
            resolve(coords)
          } catch (e) {
            reject(e)
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,      // ⏲️ 8 秒未获取到位置就触发 error 回调
          maximumAge: 0,
        }
      )
    } catch (syncErr) {
      // 3️⃣ 不安全上下文等导致的同步异常
      getCoordsByIP().then(resolve).catch(reject)
    }
  })
}

export const byQWeather = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const {latitude, longitude} = await getCoords()
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
        today: {...dealWithWeather(todayWeather), weatherKey: daily[0].iconDay},
        tomorrow: dealWithWeather(tomorrowWeather),
      }

      await setWeather(returnData)
      resolve(returnData)
    } catch (error) {
      reject(error)
    }
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
      // 六小时内最多请求一次，隔天可立即请求
      const FIVE_HOURS = 6 * 60 * 60 * 1000
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
