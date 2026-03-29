'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import Papa from 'papaparse'
import { parseAndValidateRow, QuestionSchema } from './utils'

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

export async function updateQuestion(id: string, data: z.infer<typeof QuestionSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // バリデーション
  const validated = QuestionSchema.parse(data)

  const { error } = await supabase
    .from('questions')
    .update({
      ...validated,
      reference_url: validated.reference_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/')
}

async function checkUrl(url: string): Promise<boolean> {
  try {
    // 効率のために HEAD リクエストを先に試す
    const response = await fetch(url, { 
      method: 'HEAD', 
      headers: { 'User-Agent': 'Mozilla/5.0 (QuizApp-LinkChecker)' },
      next: { revalidate: 0 } 
    })
    
    if (response.ok) return true

    // HEAD が 405 (Method Not Allowed) などの場合は GET で再試行
    if (response.status === 405 || response.status === 403 || response.status === 501) {
      const getResponse = await fetch(url, { 
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0 (QuizApp-LinkChecker)' },
        next: { revalidate: 0 } 
      })
      return getResponse.ok
    }
    return false
  } catch (e) {
    console.error(`Check failed for ${url}:`, e)
    return false
  }
}

export async function verifyReferenceLinks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // レートリミットチェック (24時間)
  const { data: history } = await supabase
    .from('link_check_history')
    .select('last_verified_at')
    .eq('user_id', user.id)
    .single()

  if (history && history.last_verified_at) {
    const lastCheck = new Date(history.last_verified_at)
    const now = new Date()
    const diffHours = (now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60)
    if (diffHours < 24) {
      const remaining = Math.ceil(24 - diffHours)
      throw new Error(`リンク確認は1日1回までです。あと約${remaining}時間後に実行可能です。`)
    }
  }

  // 参考URLがある問題を全て取得
  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, reference_url')
    .eq('user_id', user.id)
    .not('reference_url', 'is', null)
    .neq('reference_url', '')

  if (error) throw error
  if (!questions || questions.length === 0) return { count: 0 }

  // 10件ずつ並行実行してチェック
  const concurrency = 10
  const checkResults = []
  for (let i = 0; i < questions.length; i += concurrency) {
    const chunk = questions.slice(i, i + concurrency)
    const chunkPromises = chunk.map(async (q) => {
      const isOk = await checkUrl(q.reference_url!)
      return { id: q.id, is_link_broken: !isOk }
    })
    checkResults.push(...await Promise.all(chunkPromises))
  }

  // DB更新 (Supabaseクライアントの一括updateの制約により個別または小分けで実行)
  // 数百件程度ならループで十分対応可能
  await Promise.all(checkResults.map(r => 
    supabase.from('questions').update({ is_link_broken: r.is_link_broken }).eq('id', r.id)
  ))

  // 履歴の更新
  await supabase.from('link_check_history').upsert({
    user_id: user.id,
    last_verified_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  revalidatePath('/')
  return { count: questions.length }
}

export async function getLatestLinkCheck() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('link_check_history')
    .select('last_verified_at')
    .eq('user_id', user.id)
    .single()

  return data?.last_verified_at || null
}

