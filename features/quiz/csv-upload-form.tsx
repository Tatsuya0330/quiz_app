'use client'

import { useState } from 'react'
import { uploadCsv } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react'

export function CsvUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('CSVファイルを選択してください')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await uploadCsv(formData) as { count: number }
      toast.success(`${result.count}問の問題を登録しました`)
      setFile(null)
      // Reset input
      const input = document.getElementById('csv-input') as HTMLInputElement
      if (input) input.value = ''
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          問題をCSVで一括登録
        </CardTitle>
        <CardDescription>
          ヘッダー行を含み、各列が question, option_a, option_b, option_c, option_d, answer, explain, reference_url の順、カンマ区切りのCSVをアップロードしてください。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${file ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/30'}
            `}
            onClick={() => document.getElementById('csv-input')?.click()}
          >
            <Input
              id="csv-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="flex flex-col items-center gap-2">
              {file ? (
                <>
                  <FileText className="w-10 h-10 text-primary animate-in zoom-in" />
                  <p className="text-sm font-medium">{file.name}</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">クリックまたはドラッグ＆ドロップして CSV ファイルを選択</p>
                </>
              )}
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full font-bold h-12" 
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                 <span className="w-4 h-4 rounded-full border-b-2 border-current animate-spin" />
                 パース中...
              </span>
            ) : (
              'アップロードして問題を登録'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
