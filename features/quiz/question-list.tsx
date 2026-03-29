'use client'

import { useState } from 'react'
import { deleteQuestion } from './actions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Eye, Info, CheckCircle2, XCircle, Link as LinkIcon, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
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

export function QuestionList({ questions }: { questions: Question[] }) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('この問題を削除してもよろしいですか？')) return

    try {
      await deleteQuestion(id)
      toast.success('問題を削除しました')
      if (selectedQuestion?.id === id) setSelectedQuestion(null)
    } catch (e: any) {
      toast.error('削除に失敗しました: ' + e.message)
    }
  }

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
          <Dialog key={q.id}>
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
                    <Badge className="bg-primary hover:bg-primary font-black">詳細確認</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleString()}</span>
                  </div>
                  <DialogTitle className="text-2xl font-black leading-tight text-foreground">
                    {q.question}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
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

                  <Separator />

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

                  {q.reference_url && (
                    <div className="space-y-2 pb-2">
                      <h4 className="font-black flex items-center gap-2 text-primary text-sm">
                        <LinkIcon className="w-4 h-4" /> 参考URL
                      </h4>
                      <a
                        href={q.reference_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg bg-muted border text-sm font-bold hover:bg-muted/80 transition-colors truncate"
                      >
                        {q.reference_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-0 p-6 bg-muted/30 border-t flex sm:justify-between items-center gap-4">
                <Button
                  type="button"
                  variant="destructive"
                  className="font-bold gap-2"
                  onClick={(e) => handleDelete(q.id, e as any)}
                >
                  <Trash2 className="w-4 h-4" /> この問題を削除
                </Button>
                <DialogClose render={<Button type="button" variant="secondary" className="font-bold" />}>
                  閉じる
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}
