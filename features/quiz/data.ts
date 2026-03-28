import { createClient } from '@/lib/supabase/server'
import { Question } from './types'

export async function getQuestions(mode: 'all' | 'mistakes' = 'all'): Promise<Question[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  if (mode === 'mistakes') {
    // 誤答した記録がある問題を抽出
    // まず誤答した問題IDを取得
    const { data: results, error: resError } = await supabase
      .from('quiz_results')
      .select('question_id')
      .eq('user_id', user.id)
      .eq('is_correct', false)

    if (resError || !results) return []
    const mistakeIds = [...new Set(results.map(r => r.question_id))]

    if (mistakeIds.length === 0) return []

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .in('id', mistakeIds)
      .order('created_at', { ascending: false })

    if (error) return []
    return data as Question[]
  }

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as Question[]
}

export async function getStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 総問題数
  const { count: totalQuestions } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // 総回答数
  const { count: totalResults } = await supabase
    .from('quiz_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // 正解数
  const { count: correctResults } = await supabase
    .from('quiz_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_correct', true)

  const accuracy = (totalResults || 0) > 0 ? ((correctResults || 0) / (totalResults || 1)) * 100 : 0

  return {
    totalQuestions: totalQuestions || 0,
    totalResults: totalResults || 0,
    correctResults: correctResults || 0,
    accuracy: Math.round(accuracy),
  }
}

