"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Check, X, Trash2 } from "lucide-react"
import { searchSolutions, approveSolution, rejectSolution, deleteSolution } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Solution {
  id: string
  problemId: string
  userId: string
  title: string
  content: string
  createTime: string
  updateTime: string
  likes: number
  status: number
  msg?: string
}

export default function SolutionPage() {
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState("0") // 0: 待审核, 1: 已通过, 2: 已拒绝
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const fetchSolutions = async () => {
    setLoading(true)
    try {
      const response = await searchSolutions({
        keyword: searchKeyword,
        visible: Number.parseInt(statusFilter),
        pageNum: 1,
        pageSize: 20,
      })
      setSolutions(response.data || [])
    } catch (error: any) {
      toast({
        title: "获取失败",
        description: error.message || "获取题解列表失败",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSolutions()
  }, [statusFilter])

  const handleSearch = () => {
    fetchSolutions()
  }

  const handleApprove = async (solutionId: string) => {
    try {
      await approveSolution(solutionId)
      toast({
        title: "操作成功",
        description: "题解已通过审核",
      })
      fetchSolutions()
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message || "审核操作失败",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (solutionId: string) => {
    try {
      await rejectSolution(solutionId)
      toast({
        title: "操作成功",
        description: "题解已被拒绝",
      })
      fetchSolutions()
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message || "审核操作失败",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (solutionId: string) => {
    if (!confirm("确定要删除这个题解吗？此操作不可撤销。")) {
      return
    }

    try {
      await deleteSolution(solutionId)
      toast({
        title: "删除成功",
        description: "题解已被删除",
      })
      fetchSolutions()
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message || "删除题解失败",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="secondary">待审核</Badge>
      case 1:
        return <Badge variant="default">已通过</Badge>
      case 2:
        return <Badge variant="destructive">已拒绝</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">题解审核管理</h1>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  placeholder="搜索题解标题或内容..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">待审核</SelectItem>
                  <SelectItem value="1">已通过</SelectItem>
                  <SelectItem value="2">已拒绝</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                搜索
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : solutions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">暂无题解数据</div>
          ) : (
            solutions.map((solution) => (
              <Card key={solution.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{solution.title}</CardTitle>
                      <CardDescription>
                        题目ID: {solution.problemId} | 用户ID: {solution.userId} | 创建时间:{" "}
                        {new Date(solution.createTime).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">{getStatusBadge(solution.status)}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>点赞数: {solution.likes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSolution(solution)
                          setShowDetailModal(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        查看
                      </Button>
                      {solution.status === 0 && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleApprove(solution.id)}>
                            <Check className="h-4 w-4 mr-1" />
                            通过
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleReject(solution.id)}>
                            <X className="h-4 w-4 mr-1" />
                            拒绝
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleDelete(solution.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        删除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedSolution?.title}</DialogTitle>
              <DialogDescription>
                题目ID: {selectedSolution?.problemId} | 用户ID: {selectedSolution?.userId}
              </DialogDescription>
            </DialogHeader>
            {selectedSolution && (
              <div className="mt-4">
                <MarkdownRenderer content={selectedSolution.content} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
