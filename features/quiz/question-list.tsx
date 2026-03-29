'use client'

import { useState } from 'react'
import { deleteQuestion, updateQuestion } from './actions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Eye, Info, CheckCircle2, XCircle, Link as LinkIcon, FileText, Edit2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { QuestionSchema } from './utils'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Question } from './types'

type QuestionFormData = z.infer<typeof QuestionSchema>

export function QuestionList({ questions }: { questions: Question[] }) {
  if (questions.length === 0) return (
    <div className="text-center py-20 bg-background border rounded-3xl shadow-inner space-y-4">
      <div className="p-4 bg-muted rounded-full w-fit mx-auto">
        <Info className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground font-medium">登録されている問題はありません。</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {questions.map((q) => (
          <QuestionListItem key={q.id} question={q} />
        ))}
      </div>
    </div>
  )
}

function QuestionListItem({ question: q }: { question: Question }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      answer: q.answer as 'A' | 'B' | 'C' | 'D',
      explain: q.explain,
      reference_url: q.reference_url || '',
    },
  })

  // 外部からの更新（revalidatePath）に追従するために値をリセット
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setIsEditing(false)
      reset({
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        answer: q.answer as 'A' | 'B' | 'C' | 'D',
        explain: q.explain,
        reference_url: q.reference_url || '',
      })
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('この問題を削除してもよろしいですか？')) return

    try {
      await deleteQuestion(id)
      toast.success('問題を削除しました')
    } catch (e: any) {
      toast.error('削除に失敗しました: ' + e.message)
    }
  }

  const onSave = async (data: QuestionFormData) => {
    setIsSaving(true)
    try {
      await updateQuestion(q.id, data)
      toast.success('問題を更新しました')
      setIsEditing(false)
    } catch (e: any) {
      toast.error('更新に失敗しました: ' + e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditCancel = () => {
    reset()
    setIsEditing(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        nativeButton={false}
        render={<Card className="overflow-hidden group hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99] bg-background" />}
      >
        <CardContent className="p-5 flex items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-black text-xs text-primary bg-primary/5">
                作成日: {new Date(q.created_at).toLocaleDateString()}
              </Badge>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <FileText className="w-3 h-3" /> Quiz ID: {q.id.split('-')[0]}
              </span>
              {q.is_link_broken && (
                <Badge variant="outline" className="font-black text-[10px] h-5 border-none gap-1 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  リンク切れ
                </Badge>
              )}
              {q.latest_result !== undefined && (
                <Badge variant="outline" className={cn(
                  "font-black text-[10px] h-5 border-none gap-1",
                  q.latest_result 
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" 
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                )}>
                  {q.latest_result ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {q.latest_result ? "直近: 正解" : "直近: 不正解"}
                </Badge>
              )}
            </div>
            <p className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 md:line-clamp-none">
              {q.question}
            </p>
          </div>
          <div className="flex items-center gap-2 self-center">
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={(e) => handleDelete(q.id, e)}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
            <Eye className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <div className="overflow-y-auto max-h-[85vh] p-6 lg:p-8 space-y-6">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary hover:bg-primary font-black">
                {isEditing ? "問題を編集" : "詳細確認"}
              </Badge>
              <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleString()}</span>
            </div>
            {!isEditing ? (
              <DialogTitle className="text-2xl font-black leading-tight text-foreground">
                {q.question}
              </DialogTitle>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="question" className="font-bold text-primary">問題文</Label>
                <textarea
                  {...register('question')}
                  className="flex min-h-[100px] w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all resize-none"
                />
                {errors.question && <p className="text-xs font-bold text-red-500">{errors.question.message}</p>}
              </div>
            )}
          </DialogHeader>

          <div className="space-y-6">
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'A', text: q.option_a },
                  { id: 'B', text: q.option_b },
                  { id: 'C', text: q.option_c },
                  { id: 'D', text: q.option_d },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    className={cn(
                      "p-4 rounded-xl border-2 flex items-center gap-3",
                      opt.id === q.answer ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-muted bg-muted/20"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-xs font-black shrink-0",
                      opt.id === q.answer ? "bg-green-500 text-white" : "bg-muted-foreground/20 text-muted-foreground"
                    )}>
                      {opt.id}
                    </span>
                    <span className="font-medium text-sm leading-snug">{opt.text}</span>
                    {opt.id === q.answer && <CheckCircle2 className="ml-auto w-5 h-5 text-green-500 shrink-0" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['a', 'b', 'c', 'd'] as const).map((key) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`option_${key}`} className="font-bold text-primary">選択肢 {key.toUpperCase()}</Label>
                    <Input
                      {...register(`option_${key}` as keyof QuestionFormData)}
                      className="h-11 rounded-xl border-2 font-medium focus-visible:ring-primary/20 focus-visible:border-primary"
                    />
                    {errors[`option_${key}` as keyof QuestionFormData] && (
                      <p className="text-xs font-bold text-red-500">{errors[`option_${key}` as keyof QuestionFormData]?.message}</p>
                    )}
                  </div>
                ))}
                <div className="md:col-span-2 space-y-2">
                  <Label className="font-bold text-primary">正解の選択肢</Label>
                  <div className="flex gap-2">
                    {(['A', 'B', 'C', 'D'] as const).map((val) => (
                      <label key={val} className="flex-1 cursor-pointer">
                        <input
                          type="radio"
                          value={val}
                          className="sr-only peer"
                          {...register('answer')}
                        />
                        <div className="h-12 rounded-xl border-2 flex items-center justify-center font-black peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary border-muted bg-muted/20 transition-all text-sm">
                          {val}
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.answer && <p className="text-xs font-bold text-red-500">{errors.answer.message}</p>}
                </div>
              </div>
            )}

            <Separator />

            {!isEditing ? (
              <div className="space-y-3">
                <h4 className="font-black flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-5 h-5" /> 正解と解説
                </h4>
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <p className="font-bold text-primary mb-2">正解: {q.answer}</p>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {q.explain}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="explain" className="font-bold text-primary">解説</Label>
                  <textarea
                    {...register('explain')}
                    className="flex min-h-[120px] w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all resize-none"
                  />
                  {errors.explain && <p className="text-xs font-bold text-red-500">{errors.explain.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference_url" className="font-bold text-primary text-sm flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" /> 参考URL (任意)
                  </Label>
                  <Input
                    {...register('reference_url')}
                    placeholder="https://..."
                    className="h-11 rounded-xl border-2 font-medium focus-visible:ring-primary/20 focus-visible:border-primary"
                  />
                  {errors.reference_url && <p className="text-xs font-bold text-red-500">{errors.reference_url.message}</p>}
                </div>
              </div>
            )}

                {!isEditing && q.reference_url && (
                  <div className="space-y-2 pb-2">
                    <h4 className="font-black flex items-center gap-2 text-primary text-sm">
                      <LinkIcon className="w-4 h-4" /> 参考URL
                      {q.is_link_broken && (
                        <span className="flex items-center gap-1 text-red-500 text-[10px] bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900 ml-auto">
                          <AlertCircle className="w-3 h-3" />
                          アクセス不能 (404等)
                        </span>
                      )}
                    </h4>
                    <a
                      href={q.reference_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "block p-3 rounded-lg border text-sm font-bold transition-colors truncate",
                        q.is_link_broken 
                          ? "bg-red-50 border-red-200 text-red-900 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400" 
                          : "bg-muted border-muted-foreground/10 hover:bg-muted/80"
                      )}
                    >
                      {q.reference_url}
                    </a>
                  </div>
                )}
          </div>
        </div>

        <DialogFooter className="mt-0 p-6 bg-muted/30 border-t flex sm:justify-between items-center gap-4">
          {!isEditing ? (
            <>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  className="font-bold gap-2"
                  onClick={(e) => handleDelete(q.id, e as any)}
                >
                  <Trash2 className="w-4 h-4" /> 削除
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="font-bold gap-2 border-primary text-primary hover:bg-primary/5"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4" /> 編集する
                </Button>
              </div>
              <DialogClose render={<Button type="button" variant="secondary" className="font-bold" />}>
                閉じる
              </DialogClose>
            </>
          ) : (
            <>
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleEditCancel}
                  disabled={isSaving}
                  className="font-bold"
                >
                  キャンセル
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit(onSave)}
                  disabled={isSaving}
                  className="font-bold min-w-[100px]"
                >
                  {isSaving ? "保存中..." : "保存する"}
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
