import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI合同风险识别",
  description: "上传合同，AI帮你找出风险点",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased bg-slate-50/50 text-slate-900 min-h-screen flex flex-col overflow-x-hidden">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 mx-3 sm:mx-4 mt-2 sm:mt-3 rounded-2xl glass-nav shadow-lg shadow-slate-200/50">
          <div className="container-app flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                AI
              </span>
              <span className="text-lg font-semibold text-slate-900 hidden sm:inline">
                合同风险识别
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="relative text-sm text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50/80 transition-all"
              >
                首页
              </Link>
              <Link
                href="/"
                className="text-sm font-medium text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 hover:from-blue-600 hover:via-indigo-600 hover:to-violet-600 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                开始分析
              </Link>
            </div>
          </div>
        </nav>

        {/* Spacer for fixed nav */}
        <div className="h-20 sm:h-24" />

        {/* Main content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-white/60 bg-slate-50/60 backdrop-blur-sm mt-auto">
          <div className="section-divider" />
          <div className="container-app py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20">
                  AI
                </span>
                <span className="text-sm font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  合同风险识别
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <Link href="/" className="hover:text-blue-600 transition-colors">首页</Link>
                <Link href="/" className="hover:text-blue-600 transition-colors">开始分析</Link>
              </div>
              <p className="text-xs text-slate-400 text-center">
                AI辅助合同审核 · 仅供参考，不构成法律建议
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
