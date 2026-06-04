import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const fileType = file.type

  if (fileType === 'application/pdf') {
    const data = await pdfParse(buffer)
    return data.text
  }

  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  if (fileType === 'application/msword') {
    throw new Error('请将.doc文件转换为.docx格式后重新上传')
  }

  if (fileType === 'text/plain') {
    return buffer.toString('utf-8')
  }

  throw new Error('不支持的文件格式，请上传PDF或Word文档')
}
