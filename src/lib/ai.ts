export interface RiskItem {
  level: 'high' | 'medium' | 'low'
  title: string
  clause: string
  description: string
  suggestion: string
  legal_basis?: string
}

export interface AnalysisResult {
  score: number
  level: 'high' | 'medium' | 'low'
  summary: string
  risks: RiskItem[]
}

const SYSTEM_PROMPT = `你是一个专业的合同审查律师，擅长发现合同中的风险点。

请分析用户提供的合同内容，找出潜在风险，并按以下JSON格式返回:

{
  "score": 75,
  "level": "medium",
  "summary": "整体评价...",
  "risks": [
    {
      "level": "high",
      "title": "风险标题",
      "clause": "相关条款原文",
      "description": "风险描述",
      "suggestion": "修改建议",
      "legal_basis": "法律依据"
    }
  ]
}

评分标准:
- 90-100分: 低风险，合同条款公平合理
- 70-89分: 中等风险，存在一些需要注意的条款
- 0-69分: 高风险，存在明显不公平或遗漏的条款

重点关注:
1. 违约责任是否对等
2. 付款条件是否明确
3. 知识产权归属
4. 保密条款
5. 争议解决方式
6. 合同期限和续约
7. 免责条款

注意:
1. 用中文回答
2. 建议要具体可操作
3. 引用相关法律条文
4. 只返回JSON格式，不要有其他内容
`

export async function analyzeContract(text: string): Promise<AnalysisResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured')
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: '请分析以下合同内容:\n\n' + text }
      ],
      temperature: 0.7,
      max_tokens: 4096
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('DeepSeek API error:', errorText)
    let errorMsg = 'AI API error: ' + response.status
    try {
      const errJson = JSON.parse(errorText)
      if (errJson.error?.message) {
        errorMsg = errJson.error.message
      }
    } catch {
      // 解析失败就用默认错误信息
    }
    throw new Error(errorMsg)
  }

  const data = await response.json()
  const content = data.choices[0].message.content

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    return JSON.parse(jsonMatch[0]) as AnalysisResult
  } catch (error) {
    console.error('Failed to parse AI response:', content)
    throw new Error('Failed to parse AI response')
  }
}
