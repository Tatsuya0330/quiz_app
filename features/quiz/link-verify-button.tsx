'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { verifyReferenceLinks } from './actions'
import { toast } from 'sonner'
import { RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LinkVerifyButtonProps {
  lastVerifiedAt: string | null
}

export function LinkVerifyButton({ lastVerifiedAt }: LinkVerifyButtonProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [canVerify, setCanVerify] = useState(true)
  const [remainingTime, setRemainingTime] = useState<string | null>(null)

  useEffect(() => {
    if (!lastVerifiedAt) {
      setCanVerify(true)
      return
    }

    const checkTime = () => {
      const lastCheck = new Date(lastVerifiedAt)
      const now = new Date()
      const diffMs = now.getTime() - lastCheck.getTime()
      const limitMs = 24 * 60 * 60 * 1000

      if (diffMs < limitMs) {
        setCanVerify(false)
        const remainingMs = limitMs - diffMs
        const hours = Math.floor(remainingMs / (1000 * 60 * 60))
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
        setRemainingTime(`${hours}時間 ${minutes}分`)
      } else {
        setCanVerify(true)
        setRemainingTime(null)
      }
    }

    checkTime()
    const timer = setInterval(checkTime, 60000) // 1分ごとに更新
    return () => clearInterval(timer)
  }, [lastVerifiedAt])

  const handleVerify = async () => {
    if (!canVerify || isVerifying) return

    setIsVerifying(true)
    try {
      const result = await verifyReferenceLinks()
      toast.success(`${result.count}件のリンクを確認しました`)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-muted/40 rounded-2xl border border-primary/10 shadow-sm mb-6">
      <div className="flex-1 space-y-1">
        <h4 className="font-black text-sm flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-primary" />
          参考URLの有効性チェック
        </h4>
        <p className="text-xs text-muted-foreground font-medium">
          {lastVerifiedAt ? (
             <>最終確認: <span className="font-bold">{new Date(lastVerifiedAt).toLocaleString()}</span></>
          ) : (
            '一度も実行されていません'
          )}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {!canVerify && remainingTime && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-xs font-black">
            <Clock className="w-3.5 h-3.5" />
            次まで {remainingTime}
          </div>
        )}
        <Button
          onClick={handleVerify}
          disabled={!canVerify || isVerifying}
          variant={canVerify ? "default" : "secondary"}
          size="sm"
          className={cn("font-black gap-2 h-10 px-6", canVerify && "shadow-md hover:shadow-lg transition-all")}
        >
          {isVerifying ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {isVerifying ? "確認中..." : "全リンクを確認"}
        </Button>
      </div>
    </div>
  )
}
