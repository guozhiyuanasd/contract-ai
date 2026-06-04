-- Supabase SQL Schema
-- 在Supabase控制台的SQL Editor中执行

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 合同表
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200),
  file_url TEXT,
  file_type VARCHAR(100),
  original_text TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 分析结果表
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level VARCHAR(10) CHECK (risk_level IN ('high', 'medium', 'low')),
  result JSONB,
  share_token VARCHAR(20) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_created_at ON contracts(created_at DESC);
CREATE INDEX idx_analyses_contract_id ON analyses(contract_id);
CREATE INDEX idx_analyses_share_token ON analyses(share_token);

-- 启用RLS (Row Level Security)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- 创建策略（允许所有人访问，MVP阶段简化）
CREATE POLICY "Allow public read access" ON contracts FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON contracts FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON analyses FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON analyses FOR INSERT WITH CHECK (true);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS 
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
 language 'plpgsql';

CREATE TRIGGER update_contracts_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建存储桶（用于文件上传）
-- 注意：需要在Supabase控制台的Storage中手动创建 'contracts' bucket
-- 并设置为公开访问
