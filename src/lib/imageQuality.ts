export interface QualityResult {
  score: number
  blur: { score: number; ok: boolean }
  brightness: { score: number; ok: boolean }
  contrast: { score: number; ok: boolean }
  overall: 'good' | 'warning' | 'bad'
  message: string
}

export function checkImageQuality(imageData: ImageData): QualityResult {
  const { data, width, height } = imageData
  const pixelCount = width * height

  // 1. Blur detection via Laplacian variance
  const gray = new Float32Array(pixelCount)
  for (let i = 0; i < pixelCount; i++) {
    const idx = i * 4
    gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
  }

  let laplacianSum = 0
  let laplacianSqSum = 0
  let lapCount = 0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      const lap =
        -gray[idx - width] -
        gray[idx - 1] +
        4 * gray[idx] -
        gray[idx + 1] -
        gray[idx + width]
      laplacianSum += lap
      laplacianSqSum += lap * lap
      lapCount++
    }
  }
  const lapMean = laplacianSum / lapCount
  const lapVariance = laplacianSqSum / lapCount - lapMean * lapMean
  const blurScore = Math.min(100, Math.max(0, lapVariance / 50 * 100))
  const blurOk = blurScore > 20

  // 2. Brightness
  let lumSum = 0
  for (let i = 0; i < pixelCount; i++) {
    lumSum += gray[i]
  }
  const avgLum = lumSum / pixelCount
  const brightnessScore = avgLum < 80
    ? Math.max(0, (avgLum / 80) * 100)
    : avgLum > 200
      ? Math.max(0, ((255 - avgLum) / 55) * 100)
      : 100
  const brightnessOk = avgLum > 50 && avgLum < 220

  // 3. Contrast (standard deviation of luminance)
  let varSum = 0
  for (let i = 0; i < pixelCount; i++) {
    const diff = gray[i] - avgLum
    varSum += diff * diff
  }
  const stdDev = Math.sqrt(varSum / pixelCount)
  const contrastScore = Math.min(100, (stdDev / 60) * 100)
  const contrastOk = stdDev > 25

  const avgScore = (blurScore + brightnessScore + contrastScore) / 3
  let overall: 'good' | 'warning' | 'bad'
  let message: string

  if (!blurOk) {
    overall = 'bad'
    message = '图片模糊，请保持稳定后重拍'
  } else if (!brightnessOk) {
    overall = avgLum < 50 ? 'bad' : 'warning'
    message = avgLum < 50 ? '光线太暗，请在明亮处拍摄' : '光线过强，请避免反光'
  } else if (!contrastOk) {
    overall = 'warning'
    message = '对比度不足，请确保合同内容清晰'
  } else if (avgScore > 70) {
    overall = 'good'
    message = '拍摄质量良好'
  } else {
    overall = 'warning'
    message = '建议重新拍摄以获得更好的识别效果'
  }

  return {
    score: Math.round(avgScore),
    blur: { score: Math.round(blurScore), ok: blurOk },
    brightness: { score: Math.round(brightnessScore), ok: brightnessOk },
    contrast: { score: Math.round(contrastScore), ok: contrastOk },
    overall,
    message,
  }
}
