import axios from 'axios'
import { useStorage } from './storage.ts'
import { WEATHER_ICON_MAP } from './const/weatherMap.ts'
import { VERSION } from '@/libs/const'

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
    // 浏览器不支持 Geolocation：直接走 IP 兜底
    if (!( 'geolocation' in navigator )) {
      getCoordsByIP().then(resolve).catch(reject)
      return
    }

    // 尝试浏览器定位；把可能的同步异常也收进 fallback
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
          timeout: 8000,      // 8 秒未获取到位置就触发 error 回调
          maximumAge: 0,
        }
      )
    } catch (syncErr) {
      // 不安全上下文等导致的同步异常
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
      const todayIconDay = daily[0].iconDay
      const tomorrowIconDay = daily[1].iconDay

      const returnData = {
        today: dealWithWeather(todayIconDay),
        tomorrow: dealWithWeather(tomorrowIconDay),
      }

      await setWeather(returnData)
      resolve(returnData)
    } catch (error) {
      reject(error)
    }
  })
}

export function dealWithWeather(iconCode: string) {
  // 根据 iconCode 查表获取图标类型
  const weatherInfo = WEATHER_ICON_MAP[iconCode]

  if (weatherInfo) {
    return {
      iconKey: weatherInfo.iconKey,
      weatherKey: iconCode
    }
  }

  // 兜底：如果找不到对应的天气代码，返回默认值
  return {
    iconKey: 'Default' as const,
    weatherKey: iconCode
  }
}

export const setWeather = async (data: any) => {
  const cached = {
    version: VERSION,
    data,
    timestamp: Date.now()
  }
  await useStorage().setStorage('weather_cache', cached)
}

export const getWeatherData = async (): Promise<any> => {
  const cache = await useStorage().getStorage('weather_cache')
  if (cache) {
    try {
      // 检查缓存版本号，如果不匹配则丢弃旧缓存
      if (cache.version !== VERSION) {
        return await byQWeather()
      }
      
      // 天气一天请求一次，同一天内使用缓存，跨天后自动刷新
      const todayStr = new Date().toDateString()
      const cacheStr = new Date(cache.timestamp).toDateString()
      if (todayStr === cacheStr) {
        return cache.data
      }
    } catch (e) {
      console.warn('解析缓存失败', e)
    }
  }
  return await byQWeather()
}
