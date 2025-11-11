/* snowEffect.ts */
export interface SnowOptions {
  /** 雪花数量 */
  flakeCount: number;       // 默认 150
  /** X 方向风力 (负值表示向左) */
  windForce: number;        // 默认 0
  /** 雪花最小 / 最大半径 (px) */
  minSize: number;          // 默认 2
  maxSize: number;          // 默认 6
  /** 雪花最低 / 最高下落速度 (px/frame) */
  minSpeed: number;         // 默认 0.5
  maxSpeed: number;         // 默认 2
  /** 雪花左右摆动幅度 (px) */
  swirl: number;            // 默认 1.5
}

export const createSnowEffect = (
  canvas: HTMLCanvasElement,
  userOptions: Partial<SnowOptions> = {}
) => {
  /* ---------- 默认参数 ---------- */
  const options: SnowOptions = {
    flakeCount: 150,
    windForce: 0,
    minSize: 2,
    maxSize: 6,
    minSpeed: 0.5,
    maxSpeed: 2,
    swirl: 1.5,
    ...userOptions,
  }

  /* ---------- 基本变量 ---------- */
  const ctx = canvas.getContext('2d')!
  let flakes: Snowflake[] = []
  let rafId = 0
  let running = true

  /* ---------- 雪花类 ---------- */
  class Snowflake {
    x = 0
    y = 0
    r = 0           // 半径
    speed = 0       // 下落速度
    phase = 0       // 用于左右摆动
    fluffParts: Array<{x: number, y: number, size: number, opacity: number}> = []

    constructor(spawnRandomY = false) {
      this.reset(spawnRandomY)
    }

    reset(randomY = false) {
      this.r = rand(options.minSize, options.maxSize)
      this.x = Math.random() * canvas.width
      this.y = randomY ? Math.random() * canvas.height : -this.r * 2
      this.speed = rand(options.minSpeed, options.maxSpeed)
      this.phase = Math.random() * Math.PI * 2
      this.generateFluffParts()
    }

    generateFluffParts() {
      this.fluffParts = []
      const partCount = Math.floor(this.r * 0.8) + 3

      for (let i = 0; i < partCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const distance = Math.random() * this.r * 0.6
        const partSize = Math.random() * this.r * 0.4 + this.r * 0.2

        this.fluffParts.push({
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: partSize,
          opacity: Math.random() * 0.6 + 0.2
        })
      }
    }

    update() {
      this.y += this.speed
      // 左右轻微摆动 + 风力
      this.x += Math.sin(this.phase + this.y * 0.01) * options.swirl + options.windForce

      // 边界检测
      if (this.y - this.r > canvas.height || this.x + this.r < 0 || this.x - this.r > canvas.width) {
        this.reset()
      }
    }

    draw() {
      ctx.save()
      ctx.translate(this.x, this.y)

      // 绘制棉絮的各个小团（使用简化渲染减少对象创建）
      this.fluffParts.forEach(part => {
        const currentSize = part.size
        const currentOpacity = part.opacity * 0.7

        // 内层：高亮核心
        ctx.globalAlpha = currentOpacity
        ctx.fillStyle = 'rgba(255, 255, 255, 1)'
        ctx.beginPath()
        ctx.arc(part.x, part.y, currentSize * 0.4, 0, Math.PI * 2)
        ctx.fill()

        // 外层：柔和边缘
        ctx.globalAlpha = currentOpacity * 0.4
        ctx.fillStyle = 'rgba(255, 255, 255, 1)'
        ctx.beginPath()
        ctx.arc(part.x, part.y, currentSize, 0, Math.PI * 2)
        ctx.fill()
      })

      // 主体光晕（保留渐变以获得柔和边缘）
      const mainGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.r * 1.5)
      mainGradient.addColorStop(0, `rgba(255, 255, 255, 0.2)`)
      mainGradient.addColorStop(0.6, `rgba(255, 255, 255, 0.05)`)
      mainGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

      ctx.fillStyle = mainGradient
      ctx.beginPath()
      ctx.arc(0, 0, this.r * 1.5, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }
  }

  /* ---------- 工具函数 ---------- */
  const rand = (min: number, max: number) => Math.random() * ( max - min ) + min

  /* ---------- 初始化 ---------- */
  ctx.fillStyle = 'rgba(255,255,255,0.9)' // 雪花颜色
  resizeCanvas()
  initFlakes()
  loop()

  window.addEventListener('resize', resizeCanvas)

  /* ---------- 公开 API ---------- */
  return {
    updateOptions(newOpts: Partial<SnowOptions>) {
      Object.assign(options, newOpts)
      if (newOpts.flakeCount !== undefined) clampFlakeCount()
    },
    pause() {
      if (running) {
        running = false
        cancelAnimationFrame(rafId)
      }
    },
    start() {
      if (!running) {
        running = true
        loop()
      }
    },
    destroy() {
      this.pause()
      window.removeEventListener('resize', resizeCanvas)
      flakes = []
    },
  }

  /* ---------- 内部方法 ---------- */
  function initFlakes() {
    flakes = []
    for (let i = 0; i < options.flakeCount; i++) {
      flakes.push(new Snowflake(true))
    }
  }

  function clampFlakeCount() {
    if (flakes.length < options.flakeCount) {
      for (let i = flakes.length; i < options.flakeCount; i++) flakes.push(new Snowflake())
    } else if (flakes.length > options.flakeCount) {
      flakes.length = options.flakeCount
    }
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }

  function loop() {
    if (!running) return
    rafId = requestAnimationFrame(loop)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    flakes.forEach(f => {
      f.update()
      f.draw()
    })
  }
}
