export interface Question {
  id: string
  user_id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  answer: string
  explain: string
  reference_url: string | null
  created_at: string
  latest_result?: boolean
  is_link_broken?: boolean | null
}

export interface QuizResult {
  id: string
  user_id: string
  question_id: string
  selected_answer: string
  is_correct: boolean
  answered_at: string
}
