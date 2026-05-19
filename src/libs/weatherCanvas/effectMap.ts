import type { RainOptions } from './rain'
import type { SnowOptions } from './snow'

export type WeatherEffectConfig =
  | { type: 'rain'; options: Partial<RainOptions> }
  | { type: 'snow'; options: Partial<SnowOptions> }
  | { type: undefined; options: Record<string, never> }

export const resolveWeatherEffect = (weatherCode: string): WeatherEffectConfig => {
  const code = Number(weatherCode)

  if (!Number.isFinite(code)) {
    return {type: undefined, options: {}}
  }

  if (code >= 300 && code < 400) {
    if ([300, 305, 309, 313].includes(code)) {
      return {type: 'rain', options: {dropSizeMultiplier: 0.3, rainIntensity: 150}}
    }
    if (code === 306) {
      return {type: 'rain', options: {dropSizeMultiplier: 0.5, rainIntensity: 300}}
    }
    if ([307, 308, 310, 311, 312].includes(code)) {
      return {type: 'rain', options: {dropSizeMultiplier: 0.7, rainIntensity: 600}}
    }
    return {type: 'rain', options: {dropSizeMultiplier: 1, rainIntensity: 800}}
  }

  if (code >= 400 && code < 500) {
    if ([400, 406, 407].includes(code)) {
      return {
        type: 'snow',
        options: {minSize: 1, maxSize: 3, flakeCount: 160, minSpeed: 0.35, maxSpeed: 1.05, swirl: 0.55},
      }
    }
    if ([401, 408].includes(code)) {
      return {
        type: 'snow',
        options: {minSize: 1, maxSize: 4, flakeCount: 280, minSpeed: 0.55, maxSpeed: 1.65, swirl: 0.65},
      }
    }
    if ([402, 409].includes(code)) {
      return {
        type: 'snow',
        options: {
          minSize: 1,
          maxSize: 6,
          flakeCount: 760,
          minSpeed: 1,
          maxSpeed: 3.05,
          swirl: 0.75,
          windForce: 0.08,
          foregroundRatio: 0.16,
          foregroundSizeMultiplier: 1.28,
          foregroundSpeedMultiplier: 1.2,
        },
      }
    }
    if ([403, 410].includes(code)) {
      return {
        type: 'snow',
        options: {
          minSize: 1,
          maxSize: 7,
          flakeCount: 1100,
          minSpeed: 1.35,
          maxSpeed: 3.8,
          swirl: 0.9,
          windForce: 0.14,
          foregroundRatio: 0.22,
          foregroundSizeMultiplier: 1.35,
          foregroundSpeedMultiplier: 1.25,
        },
      }
    }
    return {
      type: 'snow',
      options: {
        minSize: 1,
        maxSize: 4,
        flakeCount: 520,
        minSpeed: 0.75,
        maxSpeed: 2.4,
        swirl: 0.7,
        windForce: 0.06,
        foregroundRatio: 0.1,
        foregroundSizeMultiplier: 1.2,
      },
    }
  }

  return {type: undefined, options: {}}
}
