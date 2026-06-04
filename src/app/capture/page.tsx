'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Camera, Plus, ArrowRight, ScanText, AlertCircle,
  Loader2, CheckCircle, XCircle
} from 'lucide-react'
import CameraScanner from '@/components/capture/CameraScanner'
import ScanPageList from '@/components/capture/ScanPageList'
import { getPages, getCombinedText, clearSession, updatePageOcr, createScanSession } from '@/lib/scanStore'
import { recognizeImage } from '@/lib/ocr'

type FlowStep = 'intro' | 'scanning' | 'review' | 'processing' | 'done'

export default function CapturePage() {
  const router = useRouter()
  const [step, setStep] = useState<FlowStep>('intro')
  const [showCamera, setShowCamera] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [processingMsg, setProcessingMsg] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Initialize scan session
  useEffect(() => {
    createScanSession()

    // Listen for OCR progress events
    const handler = (e: Event) => {
      const custom = e as CustomEvent
      setOcrProgress(custom.detail)
    }
    window.addEventListener('ocr-progress', handler)
    return () => window.removeEventListener('ocr-progress', handler)
  }, [])

  // Start scanning
  const handleStartScan = () => {
    setStep('scanning')
    setShowCamera(true)
  }

  // Page captured
  const handleCapture = useCallback(async (pageId: string) => {
    setShowCamera(false)
    setStep('review')
    setRefreshKey(k => k + 1)
    setPageNumber(n => n + 1)

    // Run OCR in background
    const pages = getPages()
    const page = pages.find(p => p.id === pageId)
    if (page) {
      try {
        setProcessingMsg(`正在识别第 ${pages.length} 页文字...`)
        const result = await recognizeImage(page.blob)
        updatePageOcr(pageId, result.text, Math.round(result.confidence))
        setRefreshKey(k => k + 1)
      } catch (err) {
        console.error('OCR error:', err)
        updatePageOcr(pageId, '', 0)
        setRefreshKey(k => k + 1)
      }
    }
  }, [])

  // Scan next page
  const handleScanNext = () => {
    setShowCamera(true)
  }

  // Finish scanning and analyze
  const handleAnalyze = async () => {
    const pages = getPages()
    if (pages.length === 0) {
      setError('请至少拍摄一页合同')
      return
    }

    setStep('processing')
    setError(null)
    setProcessingMsg('正在合并识别结果...')

    try {
      // Wait a moment for any pending OCR
      await new Promise(r => setTimeout(r, 500))

      const combinedText = getCombinedText()
      if (!combinedText || combinedText.trim().length < 20) {
        throw new Error('识别内容过少，请确保拍摄清晰')
      }

      setProcessingMsg('正在提交AI分析...')
      setOcrProgress(50)

      const response = await fetch('/api/ocr-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: combinedText,
          pageCount: pages.length,
          source: 'camera',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '分析失败')
      }

      const data = await response.json()
      setOcrProgress(100)
      setStep('done')
      clearSession()

      // Navigate to report
      setTimeout(() => {
        router.push('/report/' + data.contractId)
      }, 1000)
    } catch (err) {
      console.error('Analyze error:', err)
      setError((err as Error).message)
      setStep('review')
    }
  }

  // Close camera
  const handleCloseCamera = () => {
    setShowCamera(false)
    const pages = getPages()
    if (pages.length > 0) {
      setStep('review')
    } else {
      setStep('intro')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Camera overlay */}
      {showCamera && (
        <CameraScanner
          onCapture={handleCapture}
          onClose={handleCloseCamera}
          pageNumber={pageNumber}
        />
      )}

      {/* Main content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-flex items-center gap-1"
          >
            ← 返回首页
          </button>
          <h1 className="text-2xl font-bold text-slate-900">拍照识别合同</h1>
          <p className="text-slate-600 mt-1 text-sm">
            拍摄合同照片，AI自动识别并分析风险
          </p>
        </div>

        {/* Step: Intro */}
        {step === 'intro' && (
          <div className="space-y-6">
            {/* How it works */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-semibold text-slate-900 mb-4">使用步骤</h2>
              <div className="space-y-4">
                {[
                  { icon: Camera, color: 'blue', title: '拍摄合同', desc: '将合同放在光线充足的地方，对准取景框拍摄' },
                  { icon: ScanText, color: 'violet', title: '智能识别', desc: 'AI自动识别文字内容，支持多页合同' },
                  { icon: CheckCircle, color: 'emerald', title: '风险分析', desc: '自动分析合同风险点，生成详细报告' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/10 flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`w-5 h-5 text-${item.color}-500`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-600 space-y-1">
                  <p><strong>拍摄建议：</strong></p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                    <li>选择光线充足、背景简洁的环境</li>
                    <li>将合同平铺，避免折叠和遮挡</li>
                    <li>保持手机稳定，确保文字清晰</li>
                    <li>多页合同请逐页拍摄</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Start button */}
            <button
              onClick={handleStartScan}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium text-lg shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              开始拍摄
            </button>
          </div>
        )}

        {/* Step: Review scanned pages */}
        {step === 'review' && (
          <div className="space-y-4">
            <ScanPageList
              refreshKey={refreshKey}
              onRemovePage={() => {
                setRefreshKey(k => k + 1)
                setPageNumber(n => Math.max(1, n - 1))
              }}
            />

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleScanNext}
                className="py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-sm shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                继续扫描下一页
              </button>
              <button
                onClick={handleAnalyze}
                className="py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-medium text-sm shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                开始分析
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="glass-card rounded-2xl p-8 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
              <div className="absolute inset-3 flex items-center justify-center">
                <ScanText className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div>
              <p className="font-medium text-slate-900">{processingMsg}</p>
              <div className="max-w-xs mx-auto mt-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>处理进度</span>
                  <span>{ocrProgress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="glass-card rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-lg">分析完成</p>
              <p className="text-sm text-slate-500 mt-1">正在跳转到报告页面...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

