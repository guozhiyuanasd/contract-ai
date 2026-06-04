'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  ArrowLeft,
  Share2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Info,
  Lightbulb,
  Scale,
  Plus,
} from 'lucide-react'

interface RiskItem {
  level: 'high' | 'medium' | 'low'
  title: string
  clause: string
  description: string
  suggestion: string
  legal_basis?: string
}

interface AnalysisResult {
  score: number
  level: 'high' | 'medium' | 'low'
  summary: string
  risks: RiskItem[]
}

export default function ReportPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      try {
        const contractId = params.id

        const { data: contract } = await supabase
          .from('contracts')
          .select('title')
          .eq('id', contractId)
          .single()

        if (!cancelled && contract) {
          setTitle(contract.title)
        }

        const { data: analysis } = await supabase
          .from('analyses')
          .select('result')
          .eq('contract_id', contractId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (!cancelled) {
          if (analysis) {
            setResult(analysis.result as AnalysisResult)
          } else {
            setError('未找到分析结果')
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Load error:', err)
          setError('加载失败')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [params.id])

  const getScoreGradient = (score: number) => {
    if (score >= 90) {
      return { start: '#34d399', end: '#14b8a6', glow: 'bg-emerald-400' }
    }
    if (score >= 70) {
      return { start: '#fbbf24', end: '#f97316', glow: 'bg-amber-400' }
    }
    return { start: '#f87171', end: '#fb7185', glow: 'bg-red-400' }
  }

  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'high':
        return {
          label: '高风险',
          cardClass: 'risk-badge-high',
          icon: AlertTriangle,
          iconColor: 'text-red-500',
          iconBg: 'bg-red-100',
          borderAccent: 'border-l-red-500',
          glowColor: 'bg-red-400',
        }
      case 'medium':
        return {
          label: '中等风险',
          cardClass: 'risk-badge-medium',
          icon: AlertCircle,
          iconColor: 'text-amber-500',
          iconBg: 'bg-amber-100',
          borderAccent: 'border-l-amber-500',
          glowColor: 'bg-amber-400',
        }
      case 'low':
        return {
          label: '低风险',
          cardClass: 'risk-badge-low',
          icon: CheckCircle2,
          iconColor: 'text-emerald-500',
          iconBg: 'bg-emerald-100',
          borderAccent: 'border-l-emerald-500',
          glowColor: 'bg-emerald-400',
        }
      default:
        return {
          label: '未知',
          cardClass: 'bg-gray-50 text-gray-600 border border-gray-200',
          icon: AlertCircle,
          iconColor: 'text-gray-500',
          iconBg: 'bg-gray-100',
          borderAccent: 'border-l-gray-400',
          glowColor: 'bg-gray-400',
        }
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: '合同风险分析报告',
        text: title + ' - 风险评分: ' + (result ? result.score : 0) + '分',
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制到剪贴板')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="glass-card rounded-3xl p-12 sm:p-16 text-center animate-fade-in-scale">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-[-8px] rounded-full bg-blue-500/20 blur-xl animate-glow-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-slate-200/80" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-violet-500 border-l-violet-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-slate-700 font-semibold text-lg">正在加载分析报告...</p>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 sm:p-10 text-center border-t-4 border-t-red-500 animate-fade-in-scale max-w-sm w-full">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-100 to-orange-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-slate-900 font-semibold text-lg mb-4">{error || '未找到结果'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  const highRisks = result.risks.filter((r) => r.level === 'high')
  const mediumRisks = result.risks.filter((r) => r.level === 'medium')
  const lowRisks = result.risks.filter((r) => r.level === 'low')

  const scoreGradient = getScoreGradient(result.score)
  const levelConfig = getLevelConfig(result.level)
  const LevelIcon = levelConfig.icon

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (result.score / 100) * circumference

  return (
    <div className="min-h-screen bg-report-aurora">
      <div className="container-app py-6 sm:py-10 animate-fade-in max-w-4xl">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl text-sm font-medium text-slate-700 hover:text-blue-600 hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">返回首页</span>
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl text-sm font-medium text-slate-700 hover:text-blue-600 hover:shadow-md transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">分享报告</span>
          </button>
        </div>

        {/* Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 break-all">{title}</h1>
          <p className="text-slate-500 font-medium text-sm">AI 合同风险分析报告</p>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mt-4" />
        </div>

        {/* Score card */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 mb-6 sm:mb-8 relative overflow-hidden">
          {/* Background glow */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[80px] opacity-30 pointer-events-none ${scoreGradient.glow}`} />

          <div className="relative flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
            {/* Score circle */}
            <div className="relative flex-shrink-0">
              <div className={`absolute inset-[-12px] rounded-full blur-2xl opacity-40 ${scoreGradient.glow}`} />

              <svg width="180" height="180" className="transform -rotate-90 relative z-10">
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={scoreGradient.start} />
                    <stop offset="100%" stopColor={scoreGradient.end} />
                  </linearGradient>
                </defs>
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  className="track"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  className="fill"
                  stroke="url(#scoreGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <span className="text-5xl font-bold bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {result.score}
                </span>
                <span className="text-sm text-slate-400 font-medium mt-1">综合评分</span>
              </div>
            </div>

            {/* Score info */}
            <div className="flex-1 text-center sm:text-left">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4 ${levelConfig.cardClass}`}>
                <LevelIcon className="w-4 h-4" />
                {levelConfig.label}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">AI 合同风险分析结论</h2>
              <p className="text-slate-600 leading-relaxed text-base">{result.summary}</p>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-6 sm:mb-8">
          <div className="stat-card stat-card-high glass-card-hover">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-red-600 mb-1">{highRisks.length}</div>
            <div className="text-xs sm:text-sm text-slate-600 font-medium">高风险</div>
          </div>
          <div className="stat-card stat-card-medium glass-card-hover">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-600 mb-1">{mediumRisks.length}</div>
            <div className="text-xs sm:text-sm text-slate-600 font-medium">中风险</div>
          </div>
          <div className="stat-card stat-card-low glass-card-hover">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-1">{lowRisks.length}</div>
            <div className="text-xs sm:text-sm text-slate-600 font-medium">低风险</div>
          </div>
        </div>

        {/* Risk sections */}
        <div className="space-y-10">
          {highRisks.length > 0 && (
            <RiskSection title="高风险项" risks={highRisks} level="high" />
          )}
          {mediumRisks.length > 0 && (
            <RiskSection title="中风险项" risks={mediumRisks} level="medium" />
          )}
          {lowRisks.length > 0 && (
            <RiskSection title="低风险项" risks={lowRisks} level="low" />
          )}
        </div>

        {/* Action button */}
        <div className="mt-12 sm:mt-16">
          <Link
            href="/"
            className="group flex items-center justify-center gap-2.5 w-full py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            分析新合同
          </Link>
          <p className="text-center text-xs text-slate-400 mt-6">
            AI 合同风险识别 — 仅供参考，不构成法律建议
          </p>
        </div>
      </div>
    </div>
  )
}

function RiskSection({ title, risks, level }: { title: string; risks: RiskItem[]; level: string }) {
  const config = {
    high: {
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-100',
      barColor: 'bg-red-500',
      titleColor: 'text-red-700',
    },
    medium: {
      icon: AlertCircle,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-100',
      barColor: 'bg-amber-500',
      titleColor: 'text-amber-700',
    },
    low: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-100',
      barColor: 'bg-emerald-500',
      titleColor: 'text-emerald-700',
    },
  }[level] || {
    icon: AlertCircle,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-100',
    barColor: 'bg-gray-500',
    titleColor: 'text-gray-700',
  }

  const Icon = config.icon

  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center shadow-sm`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <h2 className={`text-lg font-bold ${config.titleColor}`}>{title}</h2>
        <span className="ml-auto glass-card px-3 py-1 rounded-full text-xs font-semibold text-slate-600">
          {risks.length} 项
        </span>
      </div>
      <div className="space-y-4">
        {risks.map((risk, index) => (
          <RiskCard key={index} risk={risk} level={level} index={index} />
        ))}
      </div>
    </div>
  )
}

function RiskCard({ risk, level, index }: { risk: RiskItem; level: string; index: number }) {
  const [expanded, setExpanded] = useState(false)

  const config = {
    high: {
      borderClass: 'border-l-red-500',
      badgeClass: 'risk-badge-high',
      badgeLabel: '高风险',
      icon: AlertTriangle,
      iconColor: 'text-red-500',
    },
    medium: {
      borderClass: 'border-l-amber-500',
      badgeClass: 'risk-badge-medium',
      badgeLabel: '中等风险',
      icon: AlertCircle,
      iconColor: 'text-amber-500',
    },
    low: {
      borderClass: 'border-l-emerald-500',
      badgeClass: 'risk-badge-low',
      badgeLabel: '低风险',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
    },
  }[level] || {
    borderClass: 'border-l-gray-400',
    badgeClass: 'bg-gray-50 text-gray-600 border border-gray-200',
    badgeLabel: '未知',
    icon: AlertCircle,
    iconColor: 'text-gray-500',
  }

  const Icon = config.icon

  return (
    <div
      className={`glass-card rounded-2xl border-l-[4px] ${config.borderClass} overflow-hidden transition-all duration-300 hover:shadow-lg ${expanded ? 'shadow-md' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4"
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${config.badgeClass}`}>
              <Icon className="w-3.5 h-3.5" />
              {config.badgeLabel}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 text-base sm:text-lg leading-snug">
            {risk.title}
          </h3>
          {!expanded && risk.description && (
            <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              {risk.description}
            </p>
          )}
        </div>
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center transition-all duration-300 ${expanded ? 'bg-blue-100' : ''}`}>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'text-blue-600 rotate-180' : 'text-slate-400'}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-5 border-t border-slate-100/80 animate-slide-down">
          {/* Clause */}
          <div className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                相关条款
              </h4>
            </div>
            <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 text-sm text-slate-700 leading-relaxed font-mono">
              {risk.clause}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                风险说明
              </h4>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed pl-6">
              {risk.description}
            </p>
          </div>

          {/* Suggestion */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                修改建议
              </h4>
            </div>
            <div className="bg-gradient-to-r from-amber-50/60 to-orange-50/40 border border-amber-100/60 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
              {risk.suggestion}
            </div>
          </div>

          {/* Legal basis */}
          {risk.legal_basis && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  法律依据
                </h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed pl-6">
                {risk.legal_basis}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
