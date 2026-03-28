import { Suspense } from 'react'
import { getQuestions } from '@/features/quiz/data'
import { QuestionList } from '@/features/quiz/question-list'
import { Button } from '@/components/ui/button'
import { Brain, ChevronLeft, ListChecks } from 'lucide-react'
import Link from 'next/link'

export default async function QuestionsPage() {
  const questions = await getQuestions()

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4 max-w-5xl">
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tighter hover:opacity-80 transition-opacity">
            <Brain className="w-6 h-6 text-primary" />
            CSV Quiz App
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="font-bold gap-1">
              <ChevronLeft className="w-4 h-4" /> ホームに戻る
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-black flex items-center gap-2">
            <ListChecks className="w-8 h-8 text-primary" />
            登録済みの問題
          </h1>
          <p className="text-muted-foreground font-medium">
            アップロードされた全てのクイズを確認・管理できます。カードをクリックすると詳細が表示されます。
          </p>
        </div>

        <Suspense fallback={<div className="space-y-4"><div className="h-20 bg-muted animate-pulse rounded-xl" /></div>}>
          <QuestionList questions={questions} />
        </Suspense>
      </main>
    </div>
  )
}
