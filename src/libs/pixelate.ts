export type PixelBackground = 'transparent' | 'white' | 'custom'
export type ColorCount = 'original' | 8 | 16 | 32
export type PixelSize = 'original' | number

export interface PixelateOptions {
  pixelSize: PixelSize;
  outputSize: number;
  colorCount: ColorCount;
  background: PixelBackground;
  backgroundColor: string;
  cropScale: number;
  cropOffsetX: number;
  cropOffsetY: number;
  borderRadius: number;
  colorAdjust: ColorAdjustOptions;
}

export interface ColorAdjustOptions {
  red: number;
  green: number;
  blue: number;
  brightness: number;
  saturation: number;
}

export interface PixelateResult {
  blob: Blob;
  url: string;
}

type PixelSource = string | Blob | File
type Color = [number, number, number, number]

const loadImage = (source: PixelSource): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    let objectUrl = ''

    if (typeof source === 'string') {
      if (!source.startsWith('data:') && !source.startsWith('blob:')) {
        image.crossOrigin = 'anonymous'
      }
      image.src = source
    } else {
      objectUrl = URL.createObjectURL(source)
      image.src = objectUrl
    }

    image.onload = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
      resolve(image)
    }
    image.onerror = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
      reject(new Error('图片加载失败'))
    }
  })
}

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('图片导出失败'))
      }
    }, 'image/png')
  })
}

const createRoundedPath = (context: CanvasRenderingContext2D, size: number, radius: number) => {
  const safeRadius = Math.min(radius, size / 2)
  context.beginPath()
  context.moveTo(safeRadius, 0)
  context.lineTo(size - safeRadius, 0)
  context.quadraticCurveTo(size, 0, size, safeRadius)
  context.lineTo(size, size - safeRadius)
  context.quadraticCurveTo(size, size, size - safeRadius, size)
  context.lineTo(safeRadius, size)
  context.quadraticCurveTo(0, size, 0, size - safeRadius)
  context.lineTo(0, safeRadius)
  context.quadraticCurveTo(0, 0, safeRadius, 0)
  context.closePath()
}

const getDominantChannel = (colors: Color[]): 0 | 1 | 2 => {
  const ranges = [0, 1, 2].map((channel) => {
    const values = colors.map(color => color[channel])
    return Math.max(...values) - Math.min(...values)
  })
  const channel = ranges.indexOf(Math.max(...ranges))
  return channel as 0 | 1 | 2
}

const averageColor = (colors: Color[]): Color => {
  const total = colors.reduce((acc, color) => {
    acc[0] += color[0]
    acc[1] += color[1]
    acc[2] += color[2]
    acc[3] += color[3]
    return acc
  }, [0, 0, 0, 0])
  return total.map(value => Math.round(value / colors.length)) as Color
}

const buildPalette = (colors: Color[], colorCount: number): Color[] => {
  let buckets: Color[][] = [colors]

  while (buckets.length < colorCount) {
    const bucketIndex = buckets
      .map((bucket, index) => ({bucket, index}))
      .sort((a, b) => b.bucket.length - a.bucket.length)[0]?.index

    if (bucketIndex === undefined || buckets[bucketIndex].length <= 1) {
      break
    }

    const bucket = buckets[bucketIndex]
    const channel = getDominantChannel(bucket)
    const sorted = [...bucket].sort((a, b) => a[channel] - b[channel])
    const middle = Math.floor(sorted.length / 2)
    buckets.splice(bucketIndex, 1, sorted.slice(0, middle), sorted.slice(middle))
  }

  return buckets.filter(bucket => bucket.length).map(averageColor)
}

const colorDistance = (a: Color, b: Color): number => {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
}

const nearestColor = (color: Color, palette: Color[]): Color => {
  return palette.reduce((closest, current) => {
    return colorDistance(color, current) < colorDistance(color, closest) ? current : closest
  }, palette[0])
}

const clampColorChannel = (value: number): number => {
  return Math.min(Math.max(Math.round(value), 0), 255)
}

const applyColorAdjust = (imageData: ImageData, adjust: ColorAdjustOptions): ImageData => {
  const saturationScale = 1 + adjust.saturation / 100

  for (let i = 0; i < imageData.data.length; i += 4) {
    if (imageData.data[i + 3] === 0) {
      continue
    }

    let red = imageData.data[i] + adjust.red + adjust.brightness
    let green = imageData.data[i + 1] + adjust.green + adjust.brightness
    let blue = imageData.data[i + 2] + adjust.blue + adjust.brightness

    const luminance = red * 0.299 + green * 0.587 + blue * 0.114
    red = luminance + (red - luminance) * saturationScale
    green = luminance + (green - luminance) * saturationScale
    blue = luminance + (blue - luminance) * saturationScale

    imageData.data[i] = clampColorChannel(red)
    imageData.data[i + 1] = clampColorChannel(green)
    imageData.data[i + 2] = clampColorChannel(blue)
  }

  return imageData
}

const reduceColors = (imageData: ImageData, colorCount: ColorCount): ImageData => {
  if (colorCount === 'original') {
    return imageData
  }

  const colors: Color[] = []
  for (let i = 0; i < imageData.data.length; i += 4) {
    if (imageData.data[i + 3] > 0) {
      colors.push([
        imageData.data[i],
        imageData.data[i + 1],
        imageData.data[i + 2],
        imageData.data[i + 3]
      ])
    }
  }

  if (!colors.length) {
    return imageData
  }

  const palette = buildPalette(colors, colorCount)
  for (let i = 0; i < imageData.data.length; i += 4) {
    if (imageData.data[i + 3] === 0) {
      continue
    }
    const color = nearestColor([
      imageData.data[i],
      imageData.data[i + 1],
      imageData.data[i + 2],
      imageData.data[i + 3]
    ], palette)
    imageData.data[i] = color[0]
    imageData.data[i + 1] = color[1]
    imageData.data[i + 2] = color[2]
    imageData.data[i + 3] = color[3]
  }

  return imageData
}

const pixelateLoadedImage = async (image: HTMLImageElement, options: PixelateOptions): Promise<PixelateResult> => {
  const renderSize = options.pixelSize === 'original' ? options.outputSize : options.pixelSize
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight) / options.cropScale
  const maxSourceX = image.naturalWidth - sourceSize
  const maxSourceY = image.naturalHeight - sourceSize
  const centerSourceX = (image.naturalWidth - sourceSize) / 2
  const centerSourceY = (image.naturalHeight - sourceSize) / 2
  const sourceX = Math.min(Math.max(centerSourceX - options.cropOffsetX * sourceSize, 0), maxSourceX)
  const sourceY = Math.min(Math.max(centerSourceY - options.cropOffsetY * sourceSize, 0), maxSourceY)

  const lowCanvas = document.createElement('canvas')
  lowCanvas.width = renderSize
  lowCanvas.height = renderSize
  const lowContext = lowCanvas.getContext('2d', {willReadFrequently: true})
  if (!lowContext) {
    throw new Error('无法创建图片处理上下文')
  }

  if (options.background !== 'transparent') {
    lowContext.fillStyle = options.background === 'white' ? '#ffffff' : options.backgroundColor
    lowContext.fillRect(0, 0, renderSize, renderSize)
  }

  lowContext.imageSmoothingEnabled = true
  lowContext.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    renderSize,
    renderSize
  )

  const imageData = lowContext.getImageData(0, 0, renderSize, renderSize)
  lowContext.putImageData(reduceColors(applyColorAdjust(imageData, options.colorAdjust), options.colorCount), 0, 0)

  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = options.outputSize
  outputCanvas.height = options.outputSize
  const outputContext = outputCanvas.getContext('2d')
  if (!outputContext) {
    throw new Error('无法创建导出上下文')
  }

  outputContext.imageSmoothingEnabled = false
  if (options.borderRadius > 0) {
    createRoundedPath(outputContext, options.outputSize, options.borderRadius)
    outputContext.clip()
  }
  outputContext.drawImage(lowCanvas, 0, 0, options.outputSize, options.outputSize)

  const blob = await canvasToBlob(outputCanvas)
  return {
    blob,
    url: URL.createObjectURL(blob)
  }
}

export const pixelateImage = async (source: PixelSource, options: PixelateOptions): Promise<PixelateResult> => {
  return pixelateLoadedImage(await loadImage(source), options)
}
