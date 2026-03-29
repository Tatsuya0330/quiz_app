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

          // 1日の上限チェック (200件)
          const startOfDay = new Date()
          startOfDay.setHours(0, 0, 0, 0)

          const { count, error: countError } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', startOfDay.toISOString())

          if (countError) throw countError

          const currentCount = count || 0
          const limit = 200

          if (currentCount + questionsToInsert.length > limit) {
            throw new Error(`1日の登録上限（${limit}件）を超えています。本日はあと ${Math.max(0, limit - currentCount)} 件登録可能です。`)
          }

          // Supabaseへ一括保存 (UPSERT: 既存の問題があれば上書き)
          const { error } = await supabase
            .from('questions')
            .upsert(questionsToInsert, { onConflict: 'user_id,question' })

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
      answered_at: new Date().toISOString(),
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

