import { getStats } from './data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, BarChart3, HelpCircle, CheckCircle } from 'lucide-react'

export async function DashboardStats() {
  const stats = await getStats()

  if (!stats) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold">正答率</CardTitle>
          <Target className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black">{stats.accuracy}%</div>
          <p className="text-xs text-muted-foreground pt-1">全回答数に基づきます</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold">登録問題数</CardTitle>
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black">{stats.totalQuestions}</div>
          <p className="text-xs text-muted-foreground pt-1">CSVから登録された問題</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold">総回答数</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black">{stats.totalResults}</div>
          <p className="text-xs text-muted-foreground pt-1">これまでの累計回答</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-bold">正解数</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black">{stats.correctResults}</div>
          <p className="text-xs text-muted-foreground pt-1">正確に回答された問題</p>
        </CardContent>
      </Card>
    </div>
  )
}
