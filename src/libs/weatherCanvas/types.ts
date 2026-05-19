export interface WeatherEffectController<TOptions = unknown> {
  start(): void;
  pause(): void;
  destroy(): void;
  updateOptions?(options: Partial<TOptions>): void;
}

export interface CanvasSize {
  width: number;
  height: number;
  dpr: number;
}

export interface CanvasFrame {
  /** 速度换算系数，不限制 requestAnimationFrame 的实际刷新率 */
  delta: number;
  elapsed: number;
  timestamp: number;
}
