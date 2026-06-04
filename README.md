# AI合同风险识别

扫码上传合同，AI帮你找出风险点。

## 功能特性

- ✅ 上传合同（PDF、Word、TXT）
- ✅ AI智能分析风险点
- ✅ 风险报告展示
- ✅ 分享给朋友
- ✅ 移动端适配

## 技术栈

- **前端**: Next.js 14 + React + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **文件存储**: Supabase Storage
- **AI**: 通义千问 API

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd contract-ai
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 .env.example 为 .env.local，填入以下配置：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 通义千问API
DASHSCOPE_API_KEY=your_dashscope_api_key
```

### 4. 配置Supabase

1. 访问 [supabase.com](https://supabase.com) 创建项目
2. 在 SQL Editor 中执行 supabase-schema.sql
3. 在 Storage 中创建 contracts bucket，设置为公开

### 5. 获取通义千问API Key

1. 访问 [阿里云百炼平台](https://dashscope.console.aliyun.com/)
2. 开通通义千问服务
3. 创建API Key

### 6. 运行项目

```bash
npm run dev
```

访问 http://localhost:3000

## 部署

### Vercel部署

1. Fork 本项目到你的 GitHub
2. 在 [vercel.com](https://vercel.com) 导入项目
3. 配置环境变量
4. 部署

### 自定义域名

1. 在 Vercel 项目设置中添加域名
2. 配置 DNS 解析
3. 等待证书自动配置

## 项目结构

```
contract-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts      # 分析API
│   │   ├── report/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # 报告页面
│   │   ├── globals.css           # 全局样式
│   │   ├── layout.tsx            # 布局
│   │   └── page.tsx              # 首页
│   ├── components/
│   │   └── UploadArea.tsx        # 上传组件
│   └── lib/
│       ├── ai.ts                 # AI分析
│       ├── extract.ts            # 文本提取
│       ├── supabase.ts           # Supabase客户端
│       └── upload.ts             # 文件上传
├── public/                       # 静态资源
├── supabase-schema.sql           # 数据库Schema
└── package.json
```

## 成本估算

| 项目 | 费用 |
|-----|------|
| Vercel | 免费（个人项目） |
| Supabase | 免费（500MB） |
| 通义千问 | ¥0.008/千tokens |
| 域名 | ¥50-70/年 |

## 后续计划
- [x] 支持拍照录入
- [ ] 用户登录注册
- [ ] 合同历史记录
- [ ] 批量分析
- [ ] PDF报告导出
- [ ] 更多AI模型支持


## License

MIT
