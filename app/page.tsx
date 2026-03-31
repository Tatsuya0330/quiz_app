import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getQuestions } from '@/features/quiz/data'
import { DashboardStats } from '@/features/quiz/dashboard-stats'
import { CsvUploadForm } from '@/features/quiz/csv-upload-form'
import { QuizStartCard } from '@/features/quiz/quiz-start-card'
import { Button } from '@/components/ui/button'
import { Brain, Sparkles, Plus, Info, ListChecks, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from '@/lib/utils'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const questions = await getQuestions()

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
            <Brain className="w-8 h-8 text-primary" />
            CSV Quiz App
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block text-sm text-muted-foreground mr-4">
              {user?.email}
            </span>
            <form action="/auth/sign-out" method="post">
              <Button variant="ghost" size="sm" className="font-bold">ログアウト</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10 max-w-5xl">
        {/* レッスン進捗・統計 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            学習の状況
          </h2>
          <Suspense fallback={<div className="h-32 bg-muted animate-pulse rounded-2xl" />}>
             <DashboardStats />
          </Suspense>
        </div>

        {/* クイズ開始エリア */}
        <div className="grid md:grid-cols-2 gap-6">
          <QuizStartCard 
            title="通常クイズ" 
            description="全問題の中から指定数ランダムに出題されます"
            icon={<Brain className="w-6 h-6" />}
            mode="all"
            variant="default"
            disabled={questions.length === 0}
          />
          <QuizStartCard 
            title="ニガテ克服クイズ" 
            description="過去に間違えた問題から優先的に出題されます"
            icon={<Sparkles className="w-6 h-6" />}
            mode="mistakes"
            variant="secondary"
            disabled={questions.length === 0}
          />
        </div>

        {questions.length === 0 && (
          <Alert className="bg-primary/5 border-primary/20">
            <Info className="h-4 w-4" />
            <AlertTitle className="font-bold">問題が登録されていません</AlertTitle>
            <AlertDescription>
              CSVをアップロードして、自分だけのクイズを作成しましょう。
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-4">
          <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-black flex items-center gap-2 justify-center">
              <ListChecks className="w-6 h-6 text-primary" />
              問題の管理
            </h2>
            <div className="bg-background border rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-xl">
               <div className="p-4 bg-primary/10 rounded-full">
                 <ListChecks className="w-12 h-12 text-primary" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-xl font-bold">登録済み問題一覧</h3>
                 <p className="text-muted-foreground">
                   これまでに登録した全 {questions.length} 問の確認・編集・削除が行えます。
                   新規作成や CSV インポート・エクスポートもこちらから。
                 </p>
               </div>
               <Link href="/questions" className="w-full">
                 <Button variant="outline" className="w-full h-14 text-lg font-black gap-2 hover:bg-primary hover:text-primary-foreground transition-all">
                   問題の管理ページへ <ChevronRight className="w-5 h-5" />
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
