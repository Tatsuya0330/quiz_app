import { z } from 'zod'

export const QuestionSchema = z.object({
  question: z.string().min(1, '問題文は必須です'),
  option_a: z.string().min(1, '選択肢Aは必須です'),
  option_b: z.string().min(1, '選択肢Bは必須です'),
  option_c: z.string().min(1, '選択肢Cは必須です'),
  option_d: z.string().min(1, '選択肢Dは必須です'),
  answer: z.enum(['A', 'B', 'C', 'D']),
  explain: z.string().min(1, '解説は必須です'),
  reference_url: z.string().url('有効なURLを入力してください').optional().or(z.literal('')),
})

export function parseAndValidateRow(row: any) {
  // 柔軟なパース: 小文字を大文字に、前後スペースを除去
  const rawAnswer = String(row.answer || '').trim().toUpperCase()
  
  const validated = QuestionSchema.parse({
    ...row,
    answer: rawAnswer,
    reference_url: row.reference_url || '',
  })

  return {
    ...validated,
    reference_url: validated.reference_url || null,
  }
}
