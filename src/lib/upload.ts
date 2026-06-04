import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

export async function uploadFile(file: File): Promise<string> {
  const fileName = uuidv4() + '-' + file.name
  const filePath = 'contracts/' + fileName

  const buffer = Buffer.from(await file.arrayBuffer())

  const { data, error } = await supabase.storage
    .from('contracts')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false
    })

  if (error) {
    console.error('Upload error:', error)
    throw new Error('文件上传失败: ' + error.message)
  }

  const { data: urlData } = supabase.storage
    .from('contracts')
    .getPublicUrl(filePath)

  return urlData.publicUrl
}

// 本地存储方案（不依赖Supabase Storage）
export async function uploadFileLocal(file: File): Promise<string> {
  // 返回一个占位URL，实际文件不上传
  return 'local://' + file.name
}
