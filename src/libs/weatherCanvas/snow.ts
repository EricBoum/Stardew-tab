import { createCanvasLoop } from './createCanvasLoop'
import type { CanvasSize, WeatherEffectController } from './types'

export interface SnowOptions {
  /** 雪花数量 */
  flakeCount: number;       // 默认 150
  /** X 方向风力 (负值表示向左) */
  windForce: number;        // 默认 0
  /** 雪花最小 / 最大半径 (px) */
  minSize: number;          // 默认 2
  maxSize: number;          // 默认 6
  /** 雪花最低 / 最高下落速度（以 60fps 为速度基准） */
  minSpeed: number;         // 默认 0.5
  maxSpeed: number;         // 默认 2
  /** 雪花左右摆动幅度 (px) */
  swirl: number;            // 默认 1.5
  /** 近景雪花占比，用于强化大雪 / 暴雪层次 */
  foregroundRatio: number;  // 默认 0
  /** 近景雪花尺寸系数 */
  foregroundSizeMultiplier: number;  // 默认 1.4
  /** 近景雪花速度系数 */
  foregroundSpeedMultiplier: number; // 默认 1.25
  /** 是否根据视口面积补偿雪花数量 */
  scaleCountWithViewport: boolean;   // 默认 true
}

interface SnowPixel {
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

export const createSnowEffect = (
  canvas: HTMLCanvasElement,
  userOptions: Partial<SnowOptions> = {}
): WeatherEffectController<SnowOptions> => {
  /* ---------- 默认参数 ---------- */
  const options: SnowOptions = {
    flakeCount: 150,
    windForce: 0,
    minSize: 2,
    maxSize: 6,
    minSpeed: 0.5,
    maxSpeed: 2,
    swirl: 1.5,
    foregroundRatio: 0,
    foregroundSizeMultiplier: 1.4,
    foregroundSpeedMultiplier: 1.25,
    scaleCountWithViewport: true,
    ...userOptions,
  }

  /* ---------- 基本变量 ---------- */
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('无法创建雪天动画上下文')
  }
  const ctx = context
  ctx.imageSmoothingEnabled = false
  let canvasSize: CanvasSize = {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: 1
  }
  let flakes: Snowflake[] = []

  /* ---------- 雪花类 ---------- */
  class Snowflake {
    x = 0
    y = 0
    size = 0
    speed = 0
    phase = 0
    swaySpeed = 0
    opacity = 0
    isForeground = false
    pixels: SnowPixel[] = []

    constructor(spawnRandomY = false) {
      this.reset(spawnRandomY)
    }

    reset(randomY = false) {
      this.isForeground = Math.random() < options.foregroundRatio
      const sizeMultiplier = this.isForeground ? options.foregroundSizeMultiplier : 1
      const speedMultiplier = this.isForeground ? options.foregroundSpeedMultiplier : 1

      this.size = Math.max(1, Math.round(rand(options.minSize, options.maxSize) * sizeMultiplier))
      this.x = Math.random() * canvasSize.width
      this.y = randomY ? Math.random() * canvasSize.height : -this.size * 3
      this.speed = rand(options.minSpeed, options.maxSpeed) * speedMultiplier
      this.phase = Math.random() * Math.PI * 2
      this.swaySpeed = this.isForeground ? rand(0.002, 0.006) : rand(0.003, 0.008)
      this.opacity = Math.min(1, rand(0.5, 0.92) + ( this.isForeground ? 0.08 : 0 ))
      this.generatePixels()
    }

    addPixel(x: number, y: number, size: number, opacity: number, color = '#ffffff') {
      this.pixels.push({x, y, size, opacity, color})
    }

    generatePixels() {
      this.pixels = []
      const unit = this.getPixelUnit()

      this.addPixel(0, 0, unit, 1)

      if (this.size >= 3 && Math.random() > 0.58) {
        this.addPixel(unit, unit, 1, 0.35, '#dff4ff')
      }

      if (this.isForeground && this.size >= 4 && Math.random() > 0.45) {
        this.addPixel(0, unit, 1, 0.32, '#eefaff')
      }
    }

    getPixelUnit() {
      if (this.isForeground) {
        if (this.size >= 7) {
          return 3
        }
        return this.size >= 4 ? 2 : 1
      }
      return this.size >= 5 ? 2 : 1
    }

    update(delta: number) {
      this.y += this.speed * delta
      this.x += ( Math.sin(this.phase + this.y * this.swaySpeed) * options.swirl * 0.08 + options.windForce ) * delta

      const boundary = this.size * 3
      if (this.y - boundary > canvasSize.height || this.x + boundary < 0 || this.x - boundary > canvasSize.width) {
        this.reset()
      }
    }

    draw() {
      ctx.save()
      const baseX = Math.round(this.x)
      const baseY = Math.round(this.y)
      this.pixels.forEach(pixel => {
        ctx.globalAlpha = this.opacity * pixel.opacity
        ctx.fillStyle = pixel.color
        ctx.fillRect(baseX + pixel.x, baseY + pixel.y, pixel.size, pixel.size)
      })
      ctx.restore()
    }
  }

  /* ---------- 工具函数 ---------- */
  const rand = (min: number, max: number) => Math.random() * ( max - min ) + min

  /* ---------- 初始化 ---------- */
  initFlakes()
  const canvasLoop = createCanvasLoop(canvas, {
    autoStart: false,
    onResize: (_, size) => {
      canvasSize = size
      ctx.imageSmoothingEnabled = false
      clampFlakeCount()
    },
    onFrame: (_, __, frame) => {
      flakes.forEach(f => {
        f.update(frame.delta)
        f.draw()
      })
    }
  })
  canvasLoop.start()

  /* ---------- 公开 API ---------- */
  return {
    updateOptions(newOpts: Partial<SnowOptions>) {
      Object.assign(options, newOpts)
      if (newOpts.flakeCount !== undefined) clampFlakeCount()
    },
    pause: canvasLoop.pause,
    start: canvasLoop.start,
    destroy() {
      canvasLoop.destroy()
      flakes = []
    },
  }

  /* ---------- 内部方法 ---------- */
  function initFlakes() {
    flakes = []
    const targetCount = getTargetFlakeCount()
    for (let i = 0; i < targetCount; i++) {
      flakes.push(new Snowflake(true))
    }
  }

  function clampFlakeCount() {
    const targetCount = getTargetFlakeCount()
    if (flakes.length < targetCount) {
      for (let i = flakes.length; i < targetCount; i++) flakes.push(new Snowflake())
    } else if (flakes.length > targetCount) {
      flakes.length = targetCount
    }
  }

  function getTargetFlakeCount() {
    if (!options.scaleCountWithViewport) {
      return options.flakeCount
    }

    return Math.round(options.flakeCount * getViewportDensityScale())
  }

  function getViewportDensityScale() {
    const baseArea = 1440 * 900
    const areaScale = canvasSize.width * canvasSize.height / baseArea
    return Math.min(Math.max(areaScale, 0.9), 1.75)
  }

}
