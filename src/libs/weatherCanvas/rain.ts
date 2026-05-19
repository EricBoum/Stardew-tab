import { createCanvasLoop } from './createCanvasLoop'
import type { CanvasSize, WeatherEffectController } from './types'

export interface RainOptions {
  /** 画面中的雨滴数量 */
  rainIntensity: number;      // 默认 200
  /** X 方向风力 (负值风向反向) */
  windForce: number;          // 默认 1
  /** 雨滴整体大小系数 */
  dropSizeMultiplier: number; // 默认 1.5
  /** 雨滴下落速度系数 */
  speedMultiplier: number;    // 默认 1.25
  /** 地面高度（便于溅水位置计算），默认 0 表示直接贴底 */
  groundHeight: number;       // 默认 0
}

export const createRainEffect = (
  canvas: HTMLCanvasElement,
  userOptions: Partial<RainOptions> = {}
): WeatherEffectController<RainOptions> => {
  /* ---------- 合并默认参数 ---------- */
  const options: RainOptions = {
    rainIntensity: 200,
    windForce: 1,
    dropSizeMultiplier: 1.5,
    speedMultiplier: 1.25,
    groundHeight: 0,
    ...userOptions,
  }

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('无法创建雨天动画上下文')
  }
  const ctx = context
  let canvasSize: CanvasSize = {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: 1
  }
  let raindrops: Raindrop[] = []
  let splashes: Splash[] = []

  /* ---------- 数据结构 ---------- */
  class Raindrop {
    x = 0
    y = 0
    length = 0
    speed = 0
    thickness = 0
    opacity = 0
    angle = 0

    constructor(seedRandomY = false) {
      this.reset(seedRandomY)
    }

    reset(randomY = false) {
      this.x = Math.random() * ( canvasSize.width + 200 ) - 100
      this.y = randomY ? Math.random() * canvasSize.height : -10
      this.length = Math.random() * 20 + 10
      this.speed = Math.random() * 8 + 5
      this.thickness = Math.random() * 2 + 1
      this.opacity = Math.random() * 0.6 + 0.4
      this.angle = Math.random() * 0.1 - 0.05
    }

    update(delta: number) {
      this.y += this.speed * options.speedMultiplier * delta
      this.x += ( options.windForce + this.angle ) * delta

      if (this.y > canvasSize.height - options.groundHeight) {
        this.createSplash()
        this.reset()
      }
      if (this.x < -100 || this.x > canvasSize.width + 100) this.reset()
    }

    private createSplash() {
      for (let i = 0; i < 3; i++) {
        splashes.push(new Splash(this.x, canvasSize.height - options.groundHeight))
      }
    }

    draw() {
      ctx.save()
      ctx.globalAlpha = this.opacity
      ctx.strokeStyle = '#87CEEB'
      ctx.lineWidth = this.thickness * options.dropSizeMultiplier
      ctx.lineCap = 'round'

      ctx.beginPath()
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(this.x + options.windForce * 2, this.y + this.length)
      ctx.stroke()

      // 高光
      ctx.globalAlpha = this.opacity * 0.3
      ctx.strokeStyle = '#E0F6FF'
      ctx.lineWidth = this.thickness * options.dropSizeMultiplier * 0.3
      ctx.beginPath()
      ctx.moveTo(this.x - 0.5, this.y)
      ctx.lineTo(this.x - 0.5 + options.windForce * 2, this.y + this.length)
      ctx.stroke()

      ctx.restore()
    }
  }

  class Splash {
    x: number
    y: number
    vx: number
    vy: number
    life = 1
    decay = Math.random() * 0.02 + 0.01
    size = Math.random() * 3 + 1

    constructor(x: number, y: number) {
      this.x = x
      this.y = y
      this.vx = ( Math.random() - 0.5 ) * 4
      this.vy = Math.random() * -3 - 1
    }

    update(delta: number) {
      this.x += this.vx * delta
      this.y += this.vy * delta
      this.vy += 0.1 * delta // gravity
      this.life -= this.decay * delta
    }

    draw() {
      if (this.life <= 0) return
      ctx.save()
      ctx.globalAlpha = this.life * 0.8
      ctx.fillStyle = '#B0E0E6'
      const pixelSize = Math.max(1, Math.round(this.size * this.life))
      const x = Math.round(this.x)
      const y = Math.round(this.y)
      ctx.fillRect(x, y, pixelSize, pixelSize)

      if (pixelSize > 1) {
        ctx.globalAlpha = this.life * 0.35
        ctx.fillStyle = '#E0F6FF'
        ctx.fillRect(x - pixelSize, y + pixelSize, pixelSize * 2, 1)
      }
      ctx.restore()
    }
  }

  /* ---------- 初始化 ---------- */
  initRaindrops()
  const canvasLoop = createCanvasLoop(canvas, {
    autoStart: false,
    onResize: (_, size) => {
      canvasSize = size
    },
    onFrame: (_, __, frame) => {
      raindrops.forEach(d => {
        d.update(frame.delta)
        d.draw()
      })

      splashes = splashes.filter(s => {
        s.update(frame.delta)
        s.draw()
        return s.life > 0
      })
      trimSplashes()
    }
  })
  canvasLoop.start()

  /* ---------- 公开 API ---------- */
  return {
    /** 替换或增量更新配置 */
    updateOptions(newOpts: Partial<RainOptions>) {
      Object.assign(options, newOpts)
      if (newOpts.rainIntensity !== undefined) clampRaindropCount()
    },
    /** 暂停动画 */
    pause: canvasLoop.pause,
    /** 恢复动画 */
    start: canvasLoop.start,
    /** 彻底清理 */
    destroy() {
      canvasLoop.destroy()
      raindrops = []
      splashes = []
    },
  }

  /* ---------- 内部函数 ---------- */
  function initRaindrops() {
    raindrops = []
    for (let i = 0; i < options.rainIntensity; i++) {
      raindrops.push(new Raindrop(true))
    }
  }

  function clampRaindropCount() {
    if (raindrops.length < options.rainIntensity) {
      for (let i = raindrops.length; i < options.rainIntensity; i++) {
        raindrops.push(new Raindrop())
      }
    } else if (raindrops.length > options.rainIntensity) {
      raindrops.length = options.rainIntensity
    }
  }

  function trimSplashes() {
    const maxSplashCount = Math.max(120, options.rainIntensity * 2)
    if (splashes.length > maxSplashCount) {
      splashes.splice(0, splashes.length - maxSplashCount)
    }
  }

}
