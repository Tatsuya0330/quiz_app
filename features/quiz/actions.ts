'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import Papa from 'papaparse'
import { parseAndValidateRow } from './utils'

export async function uploadCsv(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('認証が必要です')
  }

  const file = formData.get('file') as File
  if (!file) {
    throw new Error('ファイルがアップロードされていません')
  }

  const csvText = await file.text()
  
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const questionsToInsert = results.data.map((row: any) => {
            const validated = parseAndValidateRow(row)
            return {
              ...validated,
              user_id: user.id
            }
          })

          // Supabaseへ一括保存
          const { error } = await supabase
            .from('questions')
            .insert(questionsToInsert)

          if (error) throw error

          revalidatePath('/')
          resolve({ success: true, count: questionsToInsert.length })
        } catch (error: any) {
          console.error('CSV Import Error:', error)
          let message = 'データの処理中にエラーが発生しました'
          if (error instanceof z.ZodError) {
            message = `バリデーションエラー: ${error.issues[0].message}`
          } else if (error.message) {
            message = error.message
          }
          reject(new Error(message))
        }
      },
      error: (error: any) => {
        reject(new Error('CSVのパースに失敗しました: ' + error.message))
      }
    })
  })
}

export async function recordResult(questionId: string, selectedAnswer: string, isCorrect: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('quiz_results')
    .insert({
      user_id: user.id,
      question_id: questionId,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
    })

  if (error) throw error

  revalidatePath('/dashboard')
}

export async function deleteQuestion(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/')
}

