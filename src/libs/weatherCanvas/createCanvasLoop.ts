import type { CanvasFrame, CanvasSize, WeatherEffectController } from './types'

interface CanvasLoopOptions {
  autoStart?: boolean;
  clearBeforeDraw?: boolean;
  maxDpr?: number;
  onFrame: (context: CanvasRenderingContext2D, size: CanvasSize, frame: CanvasFrame) => void;
  onResize?: (context: CanvasRenderingContext2D, size: CanvasSize) => void;
}

const BASE_FRAME_DURATION = 1000 / 60
const MAX_SPEED_DELTA = 2

export const createCanvasLoop = (
  canvas: HTMLCanvasElement,
  options: CanvasLoopOptions
): WeatherEffectController => {
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('无法创建天气动画上下文')
  }

  const config = {
    autoStart: true,
    clearBeforeDraw: true,
    maxDpr: 2,
    ...options
  }

  let size: CanvasSize = {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: 1
  }
  let rafId = 0
  let running = false
  let destroyed = false
  let lastFrameTime = 0

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, config.maxDpr)
    const width = window.innerWidth
    const height = window.innerHeight

    size = {width, height, dpr}
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    canvas.style.width = `${ width }px`
    canvas.style.height = `${ height }px`

    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    options.onResize?.(context, size)
  }

  const loop = (now: number) => {
    if (!running || destroyed) {
      return
    }
    const elapsed = now - lastFrameTime
    const frame: CanvasFrame = {
      delta: Math.min(elapsed / BASE_FRAME_DURATION, MAX_SPEED_DELTA),
      elapsed,
      timestamp: now
    }
    lastFrameTime = now

    if (config.clearBeforeDraw) {
      context.clearRect(0, 0, size.width, size.height)
    }
    options.onFrame(context, size, frame)
    rafId = requestAnimationFrame(loop)
  }

  const controller: WeatherEffectController = {
    start() {
      if (running || destroyed) {
        return
      }
      running = true
      lastFrameTime = performance.now()
      rafId = requestAnimationFrame(loop)
    },
    pause() {
      if (!running) {
        return
      }
      running = false
      cancelAnimationFrame(rafId)
      rafId = 0
    },
    destroy() {
      controller.pause()
      destroyed = true
      window.removeEventListener('resize', resize)
      context.clearRect(0, 0, size.width, size.height)
    }
  }

  resize()
  window.addEventListener('resize', resize)
  if (config.autoStart) {
    controller.start()
  }

  return controller
}
