'use client'

import { useState, useEffect } from 'react'
import { FileText, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { getPages, removePage, ScannedPage } from '@/lib/scanStore'

interface ScanPageListProps {
  refreshKey: number
  onRemovePage: () => void
}

export default function ScanPageList({ refreshKey, onRemovePage }: ScanPageListProps) {
  const [pages, setPages] = useState<ScannedPage[]>([])
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    setPages(getPages())
  }, [refreshKey])

  if (pages.length === 0) return null

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">
              已扫描 {pages.length} 页
            </p>
            <p className="text-xs text-slate-500">
              {pages.filter(p => p.ocrText).length} 页已完成识别
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {pages.map((page, index) => (
            <div
              key={page.id}
              className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 group"
            >
              {/* Thumbnail */}
              <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                {page.previewUrl ? (
                  <img
                    src={page.previewUrl}
                    alt={`第${index + 1}页`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  第 {index + 1} 页
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {page.ocrText ? (
                    <span className="text-xs text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      已识别 · {page.ocrConfidence}% 准确率
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      识别中...
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    质量 {page.qualityScore}分
                  </span>
                </div>
                {page.ocrText && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {page.ocrText.substring(0, 60)}...
                  </p>
                )}
              </div>

              {/* Actions */}
              <button
                onClick={() => {
                  removePage(page.id)
                  onRemovePage()
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

