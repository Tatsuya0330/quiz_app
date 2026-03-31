'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { QuestionSchema } from './utils'
import { z } from 'zod'
import { createQuestion } from './actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Link as LinkIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

type QuestionFormData = z.infer<typeof QuestionSchema>

export function QuestionCreateDialog() {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuestionFormData>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      question: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      answer: 'A',
      explain: '',
      reference_url: '',
    },
  })

  const onSubmit = async (data: QuestionFormData) => {
    setIsSaving(true)
    try {
      await createQuestion(data)
      toast.success('問題を登録しました')
      setOpen(false)
      reset()
    } catch (e: any) {
      toast.error('登録に失敗しました: ' + e.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="font-bold gap-2">
            <Plus className="w-4 h-4" /> 問題を個別作成
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="overflow-y-auto max-h-[85vh] p-6 lg:p-8 space-y-6">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-black leading-tight text-foreground">
                新規問題の作成
              </DialogTitle>
              <div className="space-y-2">
                <Label htmlFor="question" className="font-bold text-primary">問題文</Label>
                <textarea
                  {...register('question')}
                  placeholder="問題文を入力してください"
                  className="flex min-h-[100px] w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all resize-none"
                />
                {errors.question && <p className="text-xs font-bold text-red-500">{errors.question.message}</p>}
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['a', 'b', 'c', 'd'] as const).map((key) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`option_${key}`} className="font-bold text-primary">選択肢 {key.toUpperCase()}</Label>
                    <Input
                      {...register(`option_${key}` as keyof QuestionFormData)}
                      placeholder={`選択肢 ${key.toUpperCase()} を入力`}
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

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="explain" className="font-bold text-primary">解説</Label>
                  <textarea
                    {...register('explain')}
                    placeholder="解説を入力してください"
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
            </div>
          </div>

          <DialogFooter className="mt-0 p-6 bg-muted/30 border-t flex sm:justify-end items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isSaving}
              className="font-bold"
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="font-bold min-w-[100px]"
            >
              {isSaving ? "登録中..." : "登録する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
