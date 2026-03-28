'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('確認メールを送信しました。メールを確認してください。')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        toast.error('ログインに失敗しました：' + error.message)
      } else {
        toast.success('ログインしました')
        router.refresh()
        router.push('/')
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? 'アカウント作成' : 'ログイン'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? 'メールアドレスとパスワードを入力して登録してください'
              : 'CSVクイズアプリへようこそ。ログインして始めましょう'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus:ring-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus:ring-primary/50"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full font-semibold" disabled={loading}>
              {loading ? '処理中...' : isSignUp ? '会員登録' : 'ログイン'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              {isSignUp ? '既にアカウントをお持ちですか？' : 'アカウントを持っていませんか？'}{' '}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'ログイン' : '新規登録'}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
