import { getQuestions } from '@/features/quiz/data'
import { QuizSession } from '@/features/quiz/quiz-session'
import { Brain } from 'lucide-react'
import Link from 'next/link'

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; limit?: string; time?: string }>
}) {
  const { mode, limit, time } = await searchParams
  const quizMode = mode === 'mistakes' ? 'mistakes' : 'all'
  const questions = await getQuestions(quizMode)
  
  const limitCount = parseInt(limit || '10')
  const timeLimit = parseInt(time || '5')

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="container flex h-16 items-center mx-auto px-4 max-w-5xl">
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tighter hover:opacity-80 transition-opacity">
            <Brain className="w-6 h-6 text-primary" />
            CSV Quiz App
          </Link>
          <div className="ml-auto flex gap-2">
             <span className="text-sm font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
               {quizMode === 'mistakes' ? 'ニガテ克服' : '全問題'}
             </span>
             <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
               {limitCount}問 / {timeLimit}分
             </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <QuizSession 
          questions={questions} 
          mode={quizMode} 
          limit={limitCount} 
          timeLimit={timeLimit} 
        />
      </main>
    </div>
  )
}

