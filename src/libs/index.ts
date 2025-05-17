// 防抖
export const debounce = (fn: Function, delay: number = 300) => {
  let timer: number | null = null
  return function (this: any) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments)
    }, delay)
  }
}
