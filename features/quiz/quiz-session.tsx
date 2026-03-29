'use client'

import { useState, useEffect } from 'react'
import { recordResult } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Home, Timer, BarChart3 } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Question } from './types'

interface QuizSessionProps {
  questions: Question[]
  mode: 'all' | 'mistakes'
  limit: number
  timeLimit: number
}


export function QuizSession({ questions: initialQuestions, mode, limit, timeLimit }: QuizSessionProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    // セッション開始時のみ出題順を決定
    if (questions.length === 0 && initialQuestions.length > 0) {
      const shuffle = (arr: Question[]) => [...arr].sort(() => Math.random() - 0.5)

      let resultQuestions: Question[] = []

      if (mode === 'all') {
        // 優先度順（未回答 > 直近不正解 > 直近正解）にグループ分け
        const notAnswered = initialQuestions.filter(q => q.latest_result === undefined)
        const incorrect = initialQuestions.filter(q => q.latest_result === false)
        const correct = initialQuestions.filter(q => q.latest_result === true)

        // 各グループ内をシャッフルして結合し、制限数まで取り出す
        resultQuestions = [
          ...shuffle(notAnswered),
          ...shuffle(incorrect),
          ...shuffle(correct)
        ].slice(0, limit)
      } else {
        // ニガテ克服モード等は単純シャッフル
        resultQuestions = shuffle(initialQuestions).slice(0, limit)
      }

      setQuestions(resultQuestions)
    }
  }, [initialQuestions, limit, questions.length, mode])

  useEffect(() => {
    if (isFinished || questions.length === 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsFinished(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isFinished, questions.length])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentIndex]

  const handleAnswer = async () => {
    if (!selectedAnswer || !currentQuestion || isSubmitting) return

    setIsSubmitting(true)
    const isCorrect = selectedAnswer === currentQuestion.answer
    if (isCorrect) setScore(s => s + 1)
    
    // 保存
    try {
      await recordResult(currentQuestion.id, selectedAnswer, isCorrect)
    } catch (e) {
      console.error('Failed to save result:', e)
    } finally {
      setIsSubmitting(false)
      setIsAnswered(true)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      setIsFinished(true)
    }
  }

  if (questions.length === 0) {
    return (
      <Card className="max-w-xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>対象の問題がありません</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">CSVをアップロードするか、別のモードを試してください。</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/')} className="w-full">
            戻る
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (isFinished) {
    const accuracy = Math.round((score / questions.length) * 100)
    return (
      <Card className="max-w-xl mx-auto mt-10 shadow-2xl border-primary/20 bg-gradient-to-b from-background to-muted/20">
        <CardHeader className="text-center space-y-2">
          <Badge variant="outline" className="w-fit mx-auto px-4 py-1 text-primary border-primary/30">
            {mode === 'all' ? '通常モード' : 'ニガテ克服モード'}
          </Badge>
          <CardTitle className="text-3xl font-extrabold">クイズ終了！</CardTitle>
          <p className="text-muted-foreground">お疲れ様でした。今回の結果は以下の通りです。</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-around items-center p-6 bg-background rounded-2xl border shadow-sm">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">正解数</p>
              <p className="text-4xl font-black text-primary">{score} / {questions.length}</p>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">正答率</p>
              <p className={cn("text-4xl font-black", accuracy >= 80 ? "text-green-500" : accuracy >= 50 ? "text-yellow-500" : "text-red-500")}>
                {accuracy}%
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button onClick={() => window.location.reload()} variant="default" className="w-full h-12 text-lg font-bold gap-2">
              <RotateCcw className="w-5 h-5" /> もう一度挑戦する (シャッフル)
            </Button>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full h-12 text-lg font-bold gap-2">
              <Home className="w-5 h-5" /> ホームに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm font-black text-muted-foreground px-1">
          <div className="flex items-center gap-2">
            <span className="bg-muted px-2 py-1 rounded">問題 {currentIndex + 1} / {questions.length}</span>
            <span className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 px-2 py-1 rounded">正解: {score}</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 text-lg font-black font-mono",
            timeLeft < 30 ? "text-red-500 animate-pulse" : "text-primary"
          )}>
            <Timer className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2 shadow-inner" />
      </div>

      <Card className="shadow-2xl border-none ring-1 ring-primary/10 overflow-hidden bg-background">

        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <RadioGroup 
            value={selectedAnswer || ''} 
            onValueChange={setSelectedAnswer} 
            disabled={isAnswered}
            className="grid grid-cols-1 gap-3"
          >
            {[
              { id: 'A', text: currentQuestion.option_a },
              { id: 'B', text: currentQuestion.option_b },
              { id: 'C', text: currentQuestion.option_c },
              { id: 'D', text: currentQuestion.option_d },
            ].map((opt) => (
              <Label
                key={opt.id}
                htmlFor={opt.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-muted/50",
                  selectedAnswer === opt.id && !isAnswered && "border-primary bg-primary/5",
                  isAnswered && opt.id === currentQuestion.answer && "border-green-500 bg-green-50/50 dark:bg-green-950/20",
                  isAnswered && selectedAnswer === opt.id && opt.id !== currentQuestion.answer && "border-red-500 bg-red-50/50 dark:bg-red-950/20",
                  !isAnswered && "border-muted"
                )}
              >
                <RadioGroupItem value={opt.id} id={opt.id} className="sr-only" />
                <span className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-black shrink-0",
                  selectedAnswer === opt.id ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"
                )}>
                  {opt.id}
                </span>
                <span className="text-base font-medium">{opt.text}</span>
                {isAnswered && opt.id === currentQuestion.answer && (
                  <CheckCircle2 className="ml-auto w-6 h-6 text-green-500 shrink-0" />
                )}
                {isAnswered && selectedAnswer === opt.id && opt.id !== currentQuestion.answer && (
                  <XCircle className="ml-auto w-6 h-6 text-red-500 shrink-0" />
                )}
              </Label>
            ))}
          </RadioGroup>

          {!isAnswered ? (
            <Button 
              className="w-full h-12 text-lg font-black mt-4" 
              onClick={handleAnswer} 
              disabled={!selectedAnswer || isSubmitting}
            >
              {isSubmitting ? '回答を送信中...' : '回答する'}
            </Button>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className={cn(
                "p-4 rounded-xl flex items-start gap-3",
                selectedAnswer === currentQuestion.answer ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
              )}>
                {selectedAnswer === currentQuestion.answer ? (
                   <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
                ) : (
                   <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-black text-lg">
                    {selectedAnswer === currentQuestion.answer ? '正解！' : `不正解... 正解は ${currentQuestion.answer} です`}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-black flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-5 h-5" /> 解説
                </h4>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap pl-7">
                  {currentQuestion.explain}
                </p>
                {currentQuestion.reference_url && (
                  <div className="pl-7">
                    <a 
                      href={currentQuestion.reference_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-primary hover:underline underline-offset-4"
                    >
                      🔗 関連資料・引用元を確認
                    </a>
                  </div>
                )}
              </div>

              <Button className="w-full h-12 text-lg font-black gap-2" onClick={handleNext}>
                {currentIndex < questions.length - 1 ? (
                  <>次へ進む <ChevronRight className="w-5 h-5" /></>
                ) : (
                  <>結果を見る <ChevronRight className="w-5 h-5" /></>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
