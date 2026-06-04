import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { analyzeContract } from '@/lib/ai'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { text, pageCount, source } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '请提供识别文本' },
        { status: 400 }
      )
    }

    if (text.trim().length < 20) {
      return NextResponse.json(
        { error: '识别内容过少，请确保拍摄清晰完整' },
        { status: 400 }
      )
    }

    // 1. Save contract record
    const contractId = uuidv4()
    const title = source === 'camera'
      ? `拍照识别合同 (${pageCount || 1}页)`
      : 'OCR识别合同'

    const { error: dbError } = await supabase
      .from('contracts')
      .insert({
        id: contractId,
        title,
        file_url: '',
        file_type: 'image/ocr',
        original_text: text.substring(0, 50000),
        status: 'analyzing',
      })

    if (dbError) {
      console.error('Database error:', dbError)
    }

    // 2. AI analysis
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

    // 3. Save analysis result
    const shareToken = uuidv4().substring(0, 8)
    const { error: analysisError } = await supabase
      .from('analyses')
      .insert({
        contract_id: contractId,
        risk_score: analysisResult.score,
        risk_level: analysisResult.level,
        result: analysisResult,
        share_token: shareToken,
      })

    if (analysisError) {
      console.error('Analysis save error:', analysisError)
    }

    // 4. Update contract status
    await supabase
      .from('contracts')
      .update({ status: 'completed' })
      .eq('id', contractId)

    return NextResponse.json({
      success: true,
      contractId,
      shareToken,
      result: analysisResult,
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}
