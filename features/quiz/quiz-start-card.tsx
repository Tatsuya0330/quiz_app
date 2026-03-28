'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Brain, Sparkles, Timer, ListOrdered } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface QuizStartCardProps {
  title: string
  description: string
  icon: React.ReactNode
  mode: 'all' | 'mistakes'
  variant: 'default' | 'secondary'
  disabled: boolean
}

export function QuizStartCard({ title, description, icon, mode, variant, disabled }: QuizStartCardProps) {
  const [limit, setLimit] = useState<string>('10')
  const [time, setTime] = useState<string>('5') // デフォルト5分

  const href = `/quiz?mode=${mode}&limit=${limit}&time=${time}`

  return (
    <div className={cn(
      "group relative p-6 rounded-3xl border shadow-xl transition-all h-full bg-background flex flex-col justify-between overflow-hidden",
      !disabled && "hover:-translate-y-1 hover:shadow-primary/5 dark:hover:shadow-primary/10"
    )}>
       <div className="space-y-4 mb-6">
         <div className={cn(
           "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
           variant === 'default' ? "bg-primary text-primary-foreground group-hover:bg-primary/90" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
         )}>
           {icon}
         </div>
         <div className="space-y-1">
           <h3 className="text-2xl font-black tracking-tight">{title}</h3>
           <p className="text-muted-foreground font-medium">{description}</p>
         </div>

         {!disabled && (
           <div className="pt-4 grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor={`limit-${mode}`} className="text-xs font-black flex items-center gap-1">
                 <ListOrdered className="w-3 h-3" /> 問題数
               </Label>
               <Input
                 id={`limit-${mode}`}
                 type="number"
                 min="1"
                 max="100"
                 value={limit}
                 onChange={(e) => setLimit(e.target.value)}
                 className="h-10 font-bold"
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor={`time-${mode}`} className="text-xs font-black flex items-center gap-1">
                 <Timer className="w-3 h-3" /> 制限時間 (分)
               </Label>
               <Input
                 id={`time-${mode}`}
                 type="number"
                 min="1"
                 max="60"
                 value={time}
                 onChange={(e) => setTime(e.target.value)}
                 className="h-10 font-bold"
               />
             </div>
           </div>
         )}
       </div>

       <Link href={disabled ? '#' : href} className={disabled ? 'cursor-not-allowed opacity-50 block w-full' : 'block w-full'}>
         <Button 
            variant={variant} 
            className="w-full h-14 text-lg font-black group-hover:opacity-90 transition-all"
            disabled={disabled}
         >
           挑戦をはじめる
         </Button>
       </Link>
    </div>
  )
}
