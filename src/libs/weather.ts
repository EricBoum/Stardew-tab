import axios from 'axios'

export const byGaoDe = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const {latitude, longitude} = position.coords
        const now = new Date()
        const today = now.getDay()
        let key
        if ([0,1,3,5].includes(today)) {
          key = import.meta.env.VITE_GAODE_KEY
        } else {
          key = import.meta.env.VITE_GAODE_KEY_YAO
        }
        try {
          const geoRes = await axios.get('https://restapi.amap.com/v3/geocode/regeo', {
            params: {
              location: `${ longitude },${ latitude }`,
              key
            }
          })
          const adcode = geoRes.data?.regeocode?.addressComponent?.adcode
          if (!adcode) {
            reject(new Error('未能获取 adcode'))
            return
          }
          const weatherRes = await axios.get('https://restapi.amap.com/v3/weather/weatherInfo', {
            params: {
              city: adcode,
              key,
              extensions: 'all',
              output: 'JSON'
            }
          })
          const weatherData = weatherRes.data.forecasts?.[0].casts
          let returnData = {
            today: getWeather(weatherData[0]?.dayweather),
            tomorrow: getWeather(weatherData[1]?.dayweather),
          }
          resolve(returnData)
        } catch (err) {
          reject(err)
        }
      },
      (err) => {
        reject(err)
      }
    )
  })
}

type WeatherCategory = {
  keyword: '晴' | '雨' | '风' | '雷' | '雪' | '未定义' | string;
  en: 'Sunny' | 'Rainy' | 'Windy' | 'Stormy' | 'Snowy' | 'Undefined';
};

export function getWeather(input: string): { zh: string; en: string } {
  const mapping: { keyword: string; en: WeatherCategory['en'] }[] = [
    {keyword: '雷', en: 'Stormy'},
    {keyword: '雨', en: 'Rainy'},
    {keyword: '风', en: 'Windy'},
    {keyword: '雪', en: 'Snowy'},
    {keyword: '晴', en: 'Sunny'},
  ]
  for (const {keyword, en} of mapping) {
    if (input.includes(keyword)) {
      return {zh: input, en}
    }
  }

  return {zh: input, en: 'Default'}
}
