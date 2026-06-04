'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, X, Check, RotateCcw, Zap } from 'lucide-react'
import { checkImageQuality, QualityResult } from '@/lib/imageQuality'
import { captureFrame, compressImage, detectDocumentEdges, cropToDocument } from '@/lib/imageProcess'
import { addPage } from '@/lib/scanStore'

interface CameraScannerProps {
  onCapture: (pageId: string) => void
  onClose: () => void
  pageNumber: number
}

type CameraState = 'loading' | 'ready' | 'preview' | 'quality-check'

export default function CameraScanner({ onCapture, onClose, pageNumber }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const qualityCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [state, setState] = useState<CameraState>('loading')
  const [quality, setQuality] = useState<QualityResult | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [capturedCanvas, setCapturedCanvas] = useState<HTMLCanvasElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [isProcessing, setIsProcessing] = useState(false)
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true)
  const [documentDetected, setDocumentDetected] = useState(false)

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setState('loading')
      setError(null)

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setState('ready')
      }
    } catch (err) {
      console.error('Camera error:', err)
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('请允许访问相机权限后重试')
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setError('未检测到相机设备')
      } else {
        setError('无法启动相机，请检查设备权限')
      }
    }
  }, [facingMode])

  useEffect(() => {
    startCamera()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      if (qualityCheckIntervalRef.current) {
        clearInterval(qualityCheckIntervalRef.current)
      }
    }
  }, [startCamera])

  // Real-time quality monitoring
  useEffect(() => {
    if (state !== 'ready' || !videoRef.current) return

    const checkQuality = () => {
      const video = videoRef.current
      if (!video || video.readyState < 2) return

      const canvas = document.createElement('canvas')
      // Use smaller resolution for quality check (performance)
      const scale = 0.25
      canvas.width = video.videoWidth * scale
      canvas.height = video.videoHeight * scale
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const result = checkImageQuality(imageData)
      setQuality(result)

      // Document edge detection
      if (autoDetectEnabled) {
        const edges = detectDocumentEdges(imageData, canvas.width, canvas.height)
        setDocumentDetected(edges !== null)
      }
    }

    qualityCheckIntervalRef.current = setInterval(checkQuality, 500)
    return () => {
      if (qualityCheckIntervalRef.current) {
        clearInterval(qualityCheckIntervalRef.current)
      }
    }
  }, [state, autoDetectEnabled])

  // Capture photo
  const handleCapture = async () => {
    if (!videoRef.current) return

    const { canvas, imageData, blob } = captureFrame(videoRef.current)
    const qualityResult = checkImageQuality(imageData)

    setCapturedCanvas(canvas)
    setCapturedBlob(await blob)
    setQuality(qualityResult)

    // Try auto-crop if document detected
    const edges = detectDocumentEdges(imageData, canvas.width, canvas.height)
    if (edges) {
      const cropped = cropToDocument(canvas, edges)
      setPreviewUrl(cropped.toDataURL('image/jpeg', 0.92))
      setCapturedCanvas(cropped)
      const croppedBlob = await new Promise<Blob>(r => cropped.toBlob(b => r(b!), 'image/jpeg', 0.92))
      setCapturedBlob(croppedBlob)
    } else {
      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.92))
    }

    setState('preview')
  }

  // Accept captured image
  const handleAccept = async () => {
    if (!capturedBlob) return
    setIsProcessing(true)

    try {
      const compressed = await compressImage(capturedBlob)
      const qualityScore = quality?.score || 50
      const page = addPage(compressed, qualityScore)
      onCapture(page.id)
    } catch (err) {
      console.error('Accept error:', err)
      setError('处理图片失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  // Retake photo
  const handleRetake = () => {
    setPreviewUrl(null)
    setCapturedBlob(null)
    setCapturedCanvas(null)
    setState('ready')
  }

  // Switch camera
  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
  }

  const borderColor = quality?.overall === 'good'
    ? 'border-emerald-400'
    : quality?.overall === 'warning'
      ? 'border-yellow-400'
      : 'border-slate-400/60'

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-white text-sm font-medium">
          拍摄合同 · 第 {pageNumber} 页
        </div>
        <button
          onClick={handleSwitchCamera}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80">
          <div className="bg-white rounded-2xl p-6 mx-6 max-w-sm text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-slate-900 font-medium mb-2">{error}</p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={startCamera}
                className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera view / Preview */}
      <div className="flex-1 relative overflow-hidden">
        {state === 'preview' && previewUrl ? (
          // Preview captured image
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <img
              src={previewUrl}
              alt="拍摄预览"
              className="max-w-full max-h-full object-contain"
            />

            {/* Quality indicator on preview */}
            {quality && (
              <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium backdrop-blur ${
                quality.overall === 'good'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : quality.overall === 'warning'
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {quality.message}
              </div>
            )}
          </div>
        ) : (
          // Live camera view
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Guide overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Dark overlay outside guide frame */}
              <div className="absolute inset-0 bg-black/30" />

              {/* Guide frame - A4 paper ratio */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className={`relative w-full max-w-[340px] aspect-[210/297] ${borderColor} border-2 border-dashed rounded-lg transition-colors duration-300`}>
                  {/* Corner markers */}
                  <div className={`absolute -top-1 -left-1 w-6 h-6 border-t-[3px] border-l-[3px] ${borderColor.replace('border-', 'border-')} rounded-tl-sm transition-colors`} />
                  <div className={`absolute -top-1 -right-1 w-6 h-6 border-t-[3px] border-r-[3px] ${borderColor.replace('border-', 'border-')} rounded-tr-sm transition-colors`} />
                  <div className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-[3px] border-l-[3px] ${borderColor.replace('border-', 'border-')} rounded-bl-sm transition-colors`} />
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-[3px] border-r-[3px] ${borderColor.replace('border-', 'border-')} rounded-br-sm transition-colors`} />

                  {/* Center crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <div className="w-8 h-px bg-white/60" />
                    <div className="absolute w-px h-8 bg-white/60" />
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div className="absolute bottom-32 left-0 right-0 flex flex-col items-center gap-2">
                {quality && state === 'ready' && (
                  <div className={`px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm ${
                    quality.overall === 'good'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : quality.overall === 'warning'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                  }`}>
                    {quality.overall === 'good' ? '✓ 画面清晰' : quality.message}
                  </div>
                )}

                {documentDetected && state === 'ready' && (
                  <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs backdrop-blur-sm">
                    已检测到文档
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Loading state */}
        {state === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/70 text-sm">正在启动相机...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-8 px-6">
        {/* Hint text */}
        <p className="text-white/50 text-xs text-center mb-6">
          {state === 'preview'
            ? '确认拍摄效果'
            : '将合同对准取景框，保持稳定后拍摄'}
        </p>

        {state === 'preview' ? (
          /* Preview controls: Retake / Accept */
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handleRetake}
              className="w-14 h-14 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="w-18 h-18 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform disabled:opacity-50"
              style={{ width: 72, height: 72 }}
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-8 h-8" />
              )}
            </button>
          </div>
        ) : state === 'ready' ? (
          /* Capture controls */
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setAutoDetectEnabled(prev => !prev)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white border transition-colors ${
                autoDetectEnabled
                  ? 'bg-blue-500/30 border-blue-400/50'
                  : 'bg-white/10 border-white/20'
              }`}
              title={autoDetectEnabled ? '关闭自动检测' : '开启自动检测'}
            >
              <Zap className={`w-5 h-5 ${autoDetectEnabled ? 'text-blue-300' : 'text-white/60'}`} />
            </button>
            <button
              onClick={handleCapture}
              className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center shadow-xl active:scale-95 transition-transform"
            >
              <div className="w-[60px] h-[60px] rounded-full border-2 border-slate-300 bg-white" />
            </button>
            <div className="w-12" /> {/* Spacer for symmetry */}
          </div>
        ) : null}

        {/* Page indicator */}
        <div className="flex items-center justify-center gap-1 mt-4">
          <span className="text-white/40 text-xs">
            {pageNumber > 1 ? `已拍 ${pageNumber - 1} 页 · ` : ''}正在拍摄第 {pageNumber} 页
          </span>
        </div>
      </div>
    </div>
  )
}

