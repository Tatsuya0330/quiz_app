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
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      const isCsv = droppedFile.name.toLowerCase().endsWith('.csv') || 
                    droppedFile.type === 'text/csv' || 
                    droppedFile.type === 'application/vnd.ms-excel'
      
      if (isCsv) {
        setFile(droppedFile)
      } else {
        toast.error('CSVファイルのみを選択してください')
      }
    }
  }

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
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
              ${file ? 'border-primary/50 bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/30'}
              ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'scale-100'}
            `}
            onClick={() => document.getElementById('csv-input')?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Input
              id="csv-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0]
                if (selectedFile) {
                  const isCsv = selectedFile.name.toLowerCase().endsWith('.csv') || 
                                selectedFile.type === 'text/csv' || 
                                selectedFile.type === 'application/vnd.ms-excel'
                  if (isCsv) {
                    setFile(selectedFile)
                  } else {
                    toast.error('CSVファイルのみを選択してください')
                    e.target.value = ''
                  }
                }
              }}
            />
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              {file ? (
                <>
                  <FileText className="w-10 h-10 text-primary animate-in zoom-in" />
                  <p className="text-sm font-medium">{file.name}</p>
                </>
              ) : (
                <>
                  <Upload className={`w-10 h-10 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-sm transition-colors ${isDragging ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    クリックまたはドラッグ＆ドロップして CSV ファイルを選択
                  </p>
                </>
              )}
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full font-bold h-12 text-lg shadow-md hover:shadow-lg transition-all" 
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                 <span className="w-5 h-5 rounded-full border-b-2 border-current animate-spin" />
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
