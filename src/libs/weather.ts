import axios from 'axios'
import { useStorage } from './storage.ts'
import { WEATHER_ICON_MAP } from './const/weatherMap.ts'
import { type INFORMATION, VERSION } from '@/libs/const'

type WeatherData = INFORMATION['weather']

export type WeatherLocationStatus =
  | 'idle'
  | 'success'
  | 'permission-prompt'
  | 'permission-denied'
  | 'failed'

export type WeatherPermissionStatus = PermissionState | 'unsupported' | 'unknown'

export interface WeatherResult {
  data: WeatherData;
  locationStatus: WeatherLocationStatus;
  coords?: WeatherCoords;
}

export interface WeatherLocationResult {
  permissionStatus: WeatherPermissionStatus;
  weatherResult: WeatherResult;
}

export interface WeatherCoords {
  latitude: number;
  longitude: number;
}

interface WeatherCache {
  version: string;
  data: WeatherData;
  timestamp: number;
  locationStatus?: WeatherLocationStatus;
  coords?: WeatherCoords;
}

class WeatherLocationError extends Error {
  status: WeatherLocationStatus

  constructor(status: WeatherLocationStatus, message: string) {
    super(message)
    this.name = 'WeatherLocationError'
    this.status = status
  }
}

export async function getWeatherPermissionStatus(): Promise<WeatherPermissionStatus> {
  if (!('permissions' in navigator) || !navigator.permissions?.query) {
    return 'unsupported'
  }

  try {
    const permission = await navigator.permissions.query({name: 'geolocation'})
    return permission.state
  } catch {
    return 'unknown'
  }
}

function getBrowserCoords(): Promise<WeatherCoords> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new WeatherLocationError('failed', 'Geolocation is not supported'))
      return
    }

    try {
      navigator.geolocation.getCurrentPosition(
        pos => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
        },
        err => {
          const status: WeatherLocationStatus = err.code === err.PERMISSION_DENIED
            ? 'permission-denied'
            : 'failed'
          reject(new WeatherLocationError(status, err.message))
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        }
      )
    } catch {
      reject(new WeatherLocationError('failed', 'Unable to request geolocation'))
    }
  })
}

/**
 * 获取经纬度，启动时避免主动弹出授权；未授权时不使用天气服务
 */
async function getCoords(): Promise<WeatherCoords> {
  if (!('geolocation' in navigator)) {
    throw new WeatherLocationError('failed', 'Geolocation is not supported')
  }

  const permissionState = await getWeatherPermissionStatus()

  if (permissionState === 'prompt') {
    throw new WeatherLocationError('permission-prompt', 'Location permission has not been granted')
  }

  if (permissionState === 'denied') {
    throw new WeatherLocationError('permission-denied', 'Location permission is blocked')
  }

  if (permissionState !== 'granted') {
    throw new WeatherLocationError('failed', 'Unable to verify location permission')
  }

  return getBrowserCoords()
}

async function requestQWeatherByCoords(coords: WeatherCoords): Promise<WeatherResult> {
  const weatherRes = await axios.get(import.meta.env.VITE_QWEATHER_API, {
    params: {
      location: `${ coords.longitude },${ coords.latitude }`,
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

  await setWeather(returnData, 'success', coords)
  return {
    data: returnData,
    locationStatus: 'success',
    coords
  }
}

export const byQWeather = async (): Promise<WeatherResult> => {
  const coords = await getCoords()
  return requestQWeatherByCoords(coords)
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

export const setWeather = async (
  data: WeatherData,
  locationStatus: WeatherLocationStatus,
  coords?: WeatherCoords
) => {
  const cached = {
    version: VERSION,
    data,
    timestamp: Date.now(),
    locationStatus,
    coords
  }
  await useStorage().setStorage('weather_cache', cached)
}

const isSameDay = (timestamp: number): boolean => {
  const todayStr = new Date().toDateString()
  const cacheStr = new Date(timestamp).toDateString()
  return todayStr === cacheStr
}

const getValidWeatherCache = (cache?: WeatherCache): WeatherResult | null => {
  if (
    !cache ||
    cache.version !== VERSION ||
    !isSameDay(cache.timestamp) ||
    cache.locationStatus !== 'success' ||
    !cache.coords
  ) {
    return null
  }

  return {
    data: cache.data,
    locationStatus: cache.locationStatus || 'success',
    coords: cache.coords
  }
}

export const getWeatherData = async (): Promise<WeatherResult> => {
  const permissionState = await getWeatherPermissionStatus()

  if (permissionState === 'prompt') {
    throw new WeatherLocationError('permission-prompt', 'Location permission has not been granted')
  }

  if (permissionState === 'denied') {
    throw new WeatherLocationError('permission-denied', 'Location permission is blocked')
  }

  if (permissionState !== 'granted') {
    throw new WeatherLocationError('failed', 'Unable to verify location permission')
  }

  const cache = await useStorage().getStorage<WeatherCache>('weather_cache')
  const validCache = getValidWeatherCache(cache)

  if (validCache) {
    return validCache
  }

  try {
    return await byQWeather()
  } catch (error) {
    if (error instanceof WeatherLocationError) {
      throw error
    }
    throw new WeatherLocationError('failed', 'Unable to fetch weather')
  }
}

export const requestBrowserWeatherLocation = async (): Promise<WeatherLocationResult> => {
  const coords = await getBrowserCoords()
  const weatherResult = await requestQWeatherByCoords(coords)

  return {
    permissionStatus: 'granted',
    weatherResult
  }
}

export const getWeatherLocationStatus = (error: unknown): WeatherLocationStatus => {
  if (error instanceof WeatherLocationError) {
    return error.status
  }
  return 'failed'
}
