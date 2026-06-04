let tesseractWorker: any = null
let tesseractLoading = false
let tesseractReady = false

const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'

async function loadTesseractScript(): Promise<void> {
  if (typeof window !== 'undefined' && (window as any).Tesseract) return
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TESSERACT_CDN
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Tesseract.js from CDN'))
    document.head.appendChild(script)
  })
}

async function getWorker(): Promise<any> {
  if (tesseractReady && tesseractWorker) return tesseractWorker
  if (tesseractLoading) {
    while (tesseractLoading && !tesseractReady) {
      await new Promise(r => setTimeout(r, 200))
    }
    return tesseractWorker
  }

  tesseractLoading = true
  try {
    await loadTesseractScript()
    const Tesseract = (window as any).Tesseract
    tesseractWorker = await Tesseract.createWorker('chi_sim+eng', 1, {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          const event = new CustomEvent('ocr-progress', { detail: Math.round(m.progress * 100) })
          window.dispatchEvent(event)
        }
      },
    })
    tesseractReady = true
    return tesseractWorker
  } finally {
    tesseractLoading = false
  }
}

export interface OcrResult {
  text: string
  confidence: number
  words: number
}

export async function recognizeImage(imageSource: string | Blob): Promise<OcrResult> {
  const worker = await getWorker()

  let src: string
  if (imageSource instanceof Blob) {
    src = URL.createObjectURL(imageSource)
  } else {
    src = imageSource
  }

  try {
    const result = await worker.recognize(src)
    return {
      text: result.data.text || '',
      confidence: result.data.confidence || 0,
      words: result.data.words?.length || 0,
    }
  } finally {
    if (imageSource instanceof Blob) {
      URL.revokeObjectURL(src)
    }
  }
}

export async function terminateOcr(): Promise<void> {
  if (tesseractWorker) {
    await tesseractWorker.terminate()
    tesseractWorker = null
    tesseractReady = false
  }
}
