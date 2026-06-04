import UploadArea from '@/components/UploadArea'
import { ShieldCheck, Zap, Scale, Target, Lightbulb, Files, Share2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-hero-mesh relative overflow-hidden">
        {/* Decorative glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-300/20 blur-3xl animate-glow-pulse" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-violet-300/20 blur-3xl animate-glow-pulse delay-300" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-cyan-300/10 blur-3xl animate-glow-pulse delay-600" />
        </div>

        <div className="container-app relative py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
              <span className="text-sm text-slate-700 font-medium">AI 驱动 · 智能合同审查</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight text-balance mb-6">
              <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                AI
              </span>
              合同风险识别
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              上传合同文件，AI 帮你精准识别风险条款，30 秒完成专业级审核分析
            </p>

            {/* Upload Area */}
            <div className="max-w-2xl mx-auto">
              <UploadArea />
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-10 mb-6">
              <span className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2.5 text-sm text-slate-600">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                文件不存储
              </span>
              <span className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2.5 text-sm text-slate-600">
                <Zap className="w-5 h-5 text-amber-500" />
                30 秒出结果
              </span>
              <span className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2.5 text-sm text-slate-600">
                <Scale className="w-5 h-5 text-violet-500" />
                专业法律分析
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              为什么选择 AI 合同风险识别
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              融合先进 AI 技术与专业法律知识，让合同审核更高效、更精准
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="glass-card glass-card-hover rounded-2xl p-6 lg:p-8 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">精准识别</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                AI 智能分析合同条款，精准定位违约责任、付款条件、知识产权等关键风险点
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card glass-card-hover rounded-2xl p-6 lg:p-8 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25 mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">快速高效</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                30 秒内完成全文分析，节省 90% 审核时间，让您专注于更重要的决策
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card glass-card-hover rounded-2xl p-6 lg:p-8 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 mb-5">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">专业建议</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                提供具体修改建议和法律依据，引用相关法条，助您有效规避合同风险
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card glass-card-hover rounded-2xl p-6 lg:p-8 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">安全保密</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                文件仅用于即时分析，不存储于服务器，保障您的商业机密安全
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-card glass-card-hover rounded-2xl p-6 lg:p-8 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/25 mb-5">
                <Files className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">多格式支持</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                支持 PDF、Word (.docx)、TXT 等多种格式，满足不同场景的合同审核需求
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-card glass-card-hover rounded-2xl p-6 lg:p-8 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 mb-5">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">报告分享</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                生成专业风险分析报告，支持在线分享，方便团队协作审核
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              三步完成合同审核
            </h2>
            <p className="text-slate-600">简单高效，无需专业法律知识</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 lg:gap-12 max-w-4xl mx-auto relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden sm:block absolute top-8 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

            <div className="text-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/20">
                1
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">上传合同</h3>
              <p className="text-sm text-slate-600">拖拽上传文件，或直接拍照识别</p>
            </div>

            <div className="text-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/20">
                2
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">AI 分析</h3>
              <p className="text-sm text-slate-600">AI 自动识别风险条款并评分</p>
            </div>

            <div className="text-center relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20">
                3
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">查看报告</h3>
              <p className="text-sm text-slate-600">获取详细风险分析报告和修改建议</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

