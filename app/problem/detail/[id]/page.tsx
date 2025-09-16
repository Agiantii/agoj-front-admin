"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Clock, MemoryStick } from "lucide-react"
import { searchProblems, type Problem } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { MarkdownRenderer } from "@/components/markdown-renderer"

export default function ProblemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)

  const problemId = params.id as string

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        // 使用搜索接口获取单个题目详情
        const response = await searchProblems({
          pageNum: 1,
          pageSize: 1000, // 获取所有题目然后筛选
        })

        if (response.data?.records) {
          const foundProblem = response.data.records.find((p: Problem) => p.id === problemId)
          if (foundProblem) {
            setProblem(foundProblem)
          } else {
            toast({
              title: "题目不存在",
              description: "未找到指定的题目",
              variant: "destructive",
            })
            router.push("/problem")
          }
        }
      } catch (error) {
        toast({
          title: "获取题目失败",
          description: "请检查网络连接或稍后重试",
          variant: "destructive",
        })
        router.push("/problem")
      } finally {
        setLoading(false)
      }
    }

    if (problemId) {
      fetchProblem()
    }
  }, [problemId, router, toast])

  const getDifficultyBadge = (difficulty: number) => {
    const difficultyMap = {
      1: { label: "简单", variant: "secondary" as const },
      2: { label: "中等", variant: "default" as const },
      3: { label: "困难", variant: "destructive" as const },
    }
    const config = difficultyMap[difficulty as keyof typeof difficultyMap] || {
      label: "未知",
      variant: "outline" as const,
    }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusBadge = (status: number) => {
    return status === 1 ? <Badge variant="default">已发布</Badge> : <Badge variant="secondary">草稿</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-muted-foreground">题目不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{problem.title}</h1>
            <p className="text-muted-foreground mt-1">题目 ID: {problem.id}</p>
          </div>
        </div>
        <Link href={`/problem/${problem.id}/edit`}>
          <Button className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>编辑题目</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>题目描述</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={problem.description} />
            </CardContent>
          </Card>

          {(problem.testInput || problem.testOutput) && (
            <Card>
              <CardHeader>
                <CardTitle>示例测试用例</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {problem.testInput && (
                  <div>
                    <h4 className="font-medium mb-2">输入:</h4>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">{problem.testInput}</pre>
                  </div>
                )}
                {problem.testOutput && (
                  <div>
                    <h4 className="font-medium mb-2">输出:</h4>
                    <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">{problem.testOutput}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>题目信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">难度:</span>
                {getDifficultyBadge(problem.difficulty)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">状态:</span>
                {getStatusBadge(problem.status)}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">时间限制:</span>
                </div>
                <span className="text-sm">{problem.timeLimit}ms</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MemoryStick className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">内存限制:</span>
                </div>
                <span className="text-sm">{problem.memoryLimit}MB</span>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">创建时间:</span>
                  <span className="text-sm text-muted-foreground">{new Date(problem.createTime).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
