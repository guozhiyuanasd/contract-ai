'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Plus, Camera } from 'lucide-react'

export default function UploadArea() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const { clientX, clientY } = e
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setIsDragging(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      await handleFile(files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('请上传 PDF 或 Word (.docx) 文件')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('文件大小不能超过 10MB')
      return
    }

    setIsUploading(true)
    setProgress(0)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 300)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('分析失败')
      }

      const data = await response.json()
      setProgress(100)
      clearInterval(progressInterval)

      setTimeout(() => {
        router.push('/report/' + data.contractId)
      }, 400)
    } catch (error) {
      console.error('Upload error:', error)
      clearInterval(progressInterval)
      alert('上传失败，请重试')
      setIsUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      {/* File upload area */}
      <div
        className={
          'relative rounded-2xl text-center transition-all duration-300 overflow-hidden ' +
          (isUploading
            ? 'glass-card pointer-events-none'
            : isDragging
              ? 'glass-card border-dashed border-2 border-blue-400/80 bg-blue-500/5 shadow-lg shadow-blue-500/10 ring-2 ring-blue-400/20 scale-[1.02]'
              : 'glass-card border-dashed border-2 border-slate-300/60 hover:border-slate-400/80 hover:shadow-md'
          )
        }
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="p-8 sm:p-12 space-y-5">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-[-4px] rounded-full bg-blue-500/20 blur-xl animate-glow-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-violet-500 border-l-violet-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>

            <div>
              <p className="text-lg font-medium text-slate-900 mb-1">
                正在分析合同...
              </p>
              <p className="text-sm text-slate-500">AI 正在识别风险条款，请稍候</p>
            </div>

            <div className="max-w-xs mx-auto">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>分析进度</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-300 ease-out shadow-lg shadow-blue-500/30"
                  style={{ width: progress + '%' }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-12 space-y-4">
            <div className={'w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 ' + (isDragging ? 'bg-gradient-to-br from-blue-500 to-violet-500 shadow-lg shadow-blue-500/25' : 'bg-gradient-to-br from-blue-100 to-violet-100')}>
              <Upload className={'w-8 h-8 transition-colors duration-300 ' + (isDragging ? 'text-white' : 'text-blue-500')} />
            </div>

            <div>
              <p className="text-lg font-medium text-slate-900">
                {isDragging ? '松开即可上传' : '点击或拖拽上传合同'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                支持 PDF、Word (.docx)、TXT 格式，最大 10MB
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 text-white font-medium rounded-xl hover:from-blue-600 hover:via-indigo-600 hover:to-violet-600 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              选择文件
            </button>
          </div>
        )}
      </div>

      {/* Camera capture button - visible on mobile */}
      {!isUploading && (
        <button
          onClick={() => router.push('/capture')}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2.5 hover:from-emerald-600 hover:to-teal-600"
        >
          <Camera className="w-5 h-5" />
          拍照识别合同
        </button>
      )}
    </div>
  )
}
