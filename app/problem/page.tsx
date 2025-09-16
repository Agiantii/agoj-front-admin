"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import { searchProblems, deleteProblem, createProblem, type Problem } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const pageSize = 10

  const fetchProblems = async (page = 1, keyword = "") => {
    setLoading(true)
    try {
      const response = await searchProblems({
        titleKeyword: keyword,
        pageNum: page,
        pageSize: pageSize,
      })

      if (response.data) {
        console.log(response.data)
        setProblems(response.data || [])
        setTotalPages(Math.ceil((response.data.total || 0) / pageSize))
      }
    } catch (error) {
      toast({
        title: "获取题目失败",
        description: "请检查网络连接或稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProblems(currentPage, searchKeyword)
  }, [currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchProblems(1, searchKeyword)
  }

  const handleDelete = async (problemId: string) => {
    try {
      await deleteProblem(problemId)
      toast({
        title: "删除成功",
        description: "题目已成功删除",
      })
      fetchProblems(currentPage, searchKeyword)
    } catch (error) {
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 创建空题目并跳转到编辑页面
  const handleCreateProblem = async () => {
    setIsCreating(true)
    try {
      // 创建一个空题目
      const response = await createProblem({
        title: "新题目",
        description: "请输入题目描述...",
        difficulty: 1,
        timeLimit: 1000,
        memoryLimit: 256,
        status: 0, // 草稿状态
        testInput: "",
        testOutput: "",
      })

      if (response.data && response.data.id) {
        toast({
          title: "创建成功",
          description: "正在跳转到编辑页面...",
        })
        // 跳转到编辑页面
        router.push(`/problem/edit/${response.data.id}`)
      } else {
        throw new Error("未获取到题目 ID")
      }
    } catch (error: any) {
      console.error("创建题目失败:", error)
      toast({
        title: "创建失败",
        description: error.message || "创建题目时发生错误",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">题目管理</h1>
          <p className="text-muted-foreground mt-2">管理和编辑所有编程题目</p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          onClick={handleCreateProblem}
          disabled={isCreating}
        >
          <Plus className="h-4 w-4" />
          <span>{isCreating ? "创建中..." : "创建题目"}</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>搜索题目</CardTitle>
          <CardDescription>根据题目标题搜索题目</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="输入题目标题关键词..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>题目列表</CardTitle>
          <CardDescription>共找到 {problems.length} 道题目</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">加载中...</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">暂无题目数据</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>标题</TableHead>
                    <TableHead>难度</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>时间限制</TableHead>
                    <TableHead>内存限制</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {problems.map((problem) => (
                    <TableRow key={problem.id}>
                      <TableCell className="font-mono">{problem.id}</TableCell>
                      <TableCell className="font-medium">{problem.title}</TableCell>
                      <TableCell>{getDifficultyBadge(problem.difficulty)}</TableCell>
                      <TableCell>{getStatusBadge(problem.status)}</TableCell>
                      <TableCell>{problem.timeLimit}ms</TableCell>
                      <TableCell>{problem.memoryLimit}MB</TableCell>
                      <TableCell>{new Date(problem.createTime).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Link href={`/problem/detail/${problem.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/problem/edit/${problem.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除题目 "{problem.title}" 吗？此操作不可撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(problem.id)}>删除</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {currentPage} 页，共 {totalPages} 页
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
