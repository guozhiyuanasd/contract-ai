import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { extractText } from '@/lib/extract'
import { analyzeContract } from '@/lib/ai'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '请上传文件' },
        { status: 400 }
      )
    }

    // 1. 提取文本
    let text: string
    try {
      text = await extractText(file)
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      )
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: '合同内容过少，请上传完整的合同文件' },
        { status: 400 }
      )
    }

    // 2. 保存合同记录（不存储文件）
    const contractId = uuidv4()
    const { error: dbError } = await supabase
      .from('contracts')
      .insert({
        id: contractId,
        title: file.name,
        file_url: '',
        file_type: file.type,
        original_text: text.substring(0, 50000),
        status: 'analyzing'
      })

    if (dbError) {
      console.error('Database error:', dbError)
    }

    // 3. AI分析
    let analysisResult
    try {
      analysisResult = await analyzeContract(text)
    } catch (error) {
      console.error('AI analysis error:', error)
      const errorMessage = (error as Error).message || 'AI分析失败，请稍后重试'
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    // 4. 保存分析结果
    const shareToken = uuidv4().substring(0, 8)
    const { error: analysisError } = await supabase
      .from('analyses')
      .insert({
        contract_id: contractId,
        risk_score: analysisResult.score,
        risk_level: analysisResult.level,
        result: analysisResult,
        share_token: shareToken
      })

    if (analysisError) {
      console.error('Analysis save error:', analysisError)
    }

    // 5. 更新合同状态
    await supabase
      .from('contracts')
      .update({ status: 'completed' })
      .eq('id', contractId)

    return NextResponse.json({
      success: true,
      contractId,
      shareToken,
      result: analysisResult
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
