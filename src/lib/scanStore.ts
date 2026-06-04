export interface ScannedPage {
  id: string
  blob: Blob
  previewUrl: string
  ocrText: string
  ocrConfidence: number
  qualityScore: number
  timestamp: number
}

export interface ScanSession {
  pages: ScannedPage[]
  status: 'scanning' | 'reviewing' | 'processing' | 'done'
  currentPageIndex: number
}

const SESSION_KEY = 'contract-scan-session'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

export function createScanSession(): ScanSession {
  const session: ScanSession = {
    pages: [],
    status: 'scanning',
    currentPageIndex: 0,
  }
  saveSession(session)
  return session
}

export function getSession(): ScanSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    // Restore blob URLs won't work from JSON, so pages array metadata only
    return data as ScanSession
  } catch {
    return null
  }
}

export function saveSession(session: ScanSession): void {
  if (typeof window === 'undefined') return
  // Only save metadata, not blobs
  const serializable = {
    ...session,
    pages: session.pages.map(p => ({
      ...p,
      blob: undefined,
      previewUrl: p.previewUrl,
    })),
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(serializable))
}

// In-memory store for blobs (they can't be serialized)
let memoryPages: ScannedPage[] = []

export function addPage(blob: Blob, qualityScore: number): ScannedPage {
  const page: ScannedPage = {
    id: generateId(),
    blob,
    previewUrl: URL.createObjectURL(blob),
    ocrText: '',
    ocrConfidence: 0,
    qualityScore,
    timestamp: Date.now(),
  }
  memoryPages.push(page)
  return page
}

export function updatePageOcr(pageId: string, text: string, confidence: number): void {
  const page = memoryPages.find(p => p.id === pageId)
  if (page) {
    page.ocrText = text
    page.ocrConfidence = confidence
  }
}

export function removePage(pageId: string): void {
  const idx = memoryPages.findIndex(p => p.id === pageId)
  if (idx >= 0) {
    URL.revokeObjectURL(memoryPages[idx].previewUrl)
    memoryPages.splice(idx, 1)
  }
}

export function getPages(): ScannedPage[] {
  return [...memoryPages]
}

export function clearSession(): void {
  memoryPages.forEach(p => URL.revokeObjectURL(p.previewUrl))
  memoryPages = []
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY)
  }
}

export function getCombinedText(): string {
  return memoryPages
    .map((p, i) => `--- 第${i + 1}页 ---\n${p.ocrText}`)
    .join('\n\n')
}
