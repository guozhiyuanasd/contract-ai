/**
 * Apply simple perspective correction using canvas
 * Transforms a quadrilateral region to a rectangle
 */
export function applyPerspectiveTransform(
  sourceCanvas: HTMLCanvasElement,
  corners: { x: number; y: number }[],
  outputWidth: number,
  outputHeight: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight
  const ctx = canvas.getContext('2d')!
  const srcCtx = sourceCanvas.getContext('2d')!
  const srcData = srcCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height)
  const dstImageData = ctx.createImageData(outputWidth, outputHeight)

  const [tl, tr, br, bl] = corners

  for (let y = 0; y < outputHeight; y++) {
    for (let x = 0; x < outputWidth; x++) {
      const u = x / outputWidth
      const v = y / outputHeight

      const srcX = (1 - u) * (1 - v) * tl.x + u * (1 - v) * tr.x + u * v * br.x + (1 - u) * v * bl.x
      const srcY = (1 - u) * (1 - v) * tl.y + u * (1 - v) * tr.y + u * v * br.y + (1 - u) * v * bl.y

      const sx = Math.round(srcX)
      const sy = Math.round(srcY)

      if (sx >= 0 && sx < sourceCanvas.width && sy >= 0 && sy < sourceCanvas.height) {
        const srcIdx = (sy * sourceCanvas.width + sx) * 4
        const dstIdx = (y * outputWidth + x) * 4
        dstImageData.data[dstIdx] = srcData.data[srcIdx]
        dstImageData.data[dstIdx + 1] = srcData.data[srcIdx + 1]
        dstImageData.data[dstIdx + 2] = srcData.data[srcIdx + 2]
        dstImageData.data[dstIdx + 3] = 255
      }
    }
  }

  ctx.putImageData(dstImageData, 0, 0)
  return canvas
}

/**
 * Detect document edges using simple threshold + contour detection
 * Returns 4 corner points of the detected document
 */
export function detectDocumentEdges(
  imageData: ImageData,
  width: number,
  height: number
): { x: number; y: number }[] | null {
  const { data } = imageData

  const gray = new Uint8Array(width * height)
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4
    gray[i] = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2])
  }

  let minX = width, maxX = 0, minY = height, maxY = 0
  const threshold = 128

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (gray[y * width + x] > threshold) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      }
    }
  }

  const area = (maxX - minX) * (maxY - minY)
  const totalArea = width * height
  if (area < totalArea * 0.1) {
    return null
  }

  const margin = Math.min(width, height) * 0.02
  return [
    { x: Math.max(0, minX - margin), y: Math.max(0, minY - margin) },
    { x: Math.min(width, maxX + margin), y: Math.max(0, minY - margin) },
    { x: Math.min(width, maxX + margin), y: Math.min(height, maxY + margin) },
    { x: Math.max(0, minX - margin), y: Math.min(height, maxY + margin) },
  ]
}

/**
 * Crop image to document region with perspective correction
 */
export function cropToDocument(
  sourceCanvas: HTMLCanvasElement,
  corners: { x: number; y: number }[]
): HTMLCanvasElement {
  const [tl, tr, br, bl] = corners

  const topWidth = Math.sqrt((tr.x - tl.x) ** 2 + (tr.y - tl.y) ** 2)
  const bottomWidth = Math.sqrt((br.x - bl.x) ** 2 + (br.y - bl.y) ** 2)
  const leftHeight = Math.sqrt((bl.x - tl.x) ** 2 + (bl.y - tl.y) ** 2)
  const rightHeight = Math.sqrt((br.x - tr.x) ** 2 + (br.y - tr.y) ** 2)

  const outputWidth = Math.round(Math.max(topWidth, bottomWidth))
  const outputHeight = Math.round(Math.max(leftHeight, rightHeight))

  const maxDim = 2048
  const scale = Math.min(1, maxDim / Math.max(outputWidth, outputHeight))
  const finalW = Math.round(outputWidth * scale)
  const finalH = Math.round(outputHeight * scale)

  return applyPerspectiveTransform(sourceCanvas, corners, finalW, finalH)
}

/**
 * Compress image blob to target size
 */
export async function compressImage(
  blob: Blob,
  maxWidth = 1600,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let w = img.width
      let h = img.height

      if (w > maxWidth) {
        h = Math.round(h * maxWidth / w)
        w = maxWidth
      }

      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, w, h)

      canvas.toBlob(
        (b) => resolve(b || blob),
        'image/jpeg',
        quality
      )
    }
    img.src = URL.createObjectURL(blob)
  })
}

/**
 * Capture a frame from video element
 */
export function captureFrame(video: HTMLVideoElement): {
  canvas: HTMLCanvasElement
  imageData: ImageData
  blob: Promise<Blob>
} {
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(video, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  const blob = new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92)
  })

  return { canvas, imageData, blob }
}
