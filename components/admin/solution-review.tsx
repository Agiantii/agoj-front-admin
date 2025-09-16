"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  searchSolutions,
  approveSolution,
  rejectSolution,
  updateSolution,
  deleteSolution,
  type Solution,
} from "@/lib/api"
import {
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Loader2,
  Eye,
  MessageSquare,
} from "lucide-react"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface SolutionWithDetails extends Solution {
  username?: string
  problemTitle?: string
}

const statusLabels = {
  0: { label: "待审核", color: "bg-yellow-500", icon: Clock },
  1: { label: "已通过", color: "bg-green-500", icon: CheckCircle },
  2: { label: "已拒绝", color: "bg-red-500", icon: XCircle },
}

export function SolutionReview() {
  const [solutions, setSolutions] = useState<SolutionWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState("0") // 默认显示待审核
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingSolution, setEditingSolution] = useState<SolutionWithDetails | null>(null)
  const [viewingSolution, setViewingSolution] = useState<SolutionWithDetails | null>(null)
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    status: 0,
    msg: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    loadSolutions()
  }, [statusFilter])

  const loadSolutions = async () => {
    setLoading(true)
    try {
      const response = await searchSolutions({
        keyword: searchKeyword,
        visible: Number.parseInt(statusFilter),
        pageNum: 1,
        pageSize: 50,
      })
      if (response.code === 0 || response.code === 200) {
        setSolutions(response.data.records || [])
      }
    } catch (error: any) {
      toast({
        title: "加载失败",
        description: error.message || "无法加载题解列表",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadSolutions()
  }

  const handleApprove = async (solutionId: string) => {
    try {
      const response = await approveSolution(solutionId)
      if (response.code === 0 || response.code === 200) {
        toast({
          title: "审核通过",
          description: "题解已通过审核",
        })
        loadSolutions()
      }
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
      const response = await rejectSolution(solutionId)
      if (response.code === 0 || response.code === 200) {
        toast({
          title: "审核拒绝",
          description: "题解已被拒绝",
        })
        loadSolutions()
      }
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message || "审核操作失败",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSolution) return

    setLoading(true)
    try {
      const response = await updateSolution(editingSolution.id, editForm)
      if (response.code === 0 || response.code === 200) {
        toast({
          title: "更新成功",
          description: "题解已成功更新",
        })
        setShowEditModal(false)
        setEditingSolution(null)
        loadSolutions()
      }
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message || "更新题解时出现错误",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (solutionId: string) => {
    if (!confirm("确定要删除这个题解吗？此操作不可撤销。")) return

    try {
      const response = await deleteSolution(solutionId)
      if (response.code === 0 || response.code === 200) {
        toast({
          title: "删除成功",
          description: "题解已成功删除",
        })
        loadSolutions()
      }
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message || "删除题解时出现错误",
        variant: "destructive",
      })
    }
  }

  const openEditModal = (solution: SolutionWithDetails) => {
    setEditingSolution(solution)
    setEditForm({
      title: solution.title,
      content: solution.content,
      status: solution.status,
      msg: solution.msg || "",
    })
    setShowEditModal(true)
  }

  const openViewModal = (solution: SolutionWithDetails) => {
    setViewingSolution(solution)
    setShowViewModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">题解审核</h1>
          <p className="text-muted-foreground mt-2">审核用户提交的题解，确保内容质量</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="搜索题解标题或内容..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">待审核</SelectItem>
            <SelectItem value="1">已通过</SelectItem>
            <SelectItem value="2">已拒绝</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="mr-2 h-4 w-4" />
          搜索
        </Button>
      </div>

      {/* Solutions List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : solutions.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">暂无题解</h3>
                <p className="mt-1 text-sm text-muted-foreground">当前筛选条件下没有找到题解</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          solutions.map((solution) => {
            const statusInfo = statusLabels[solution.status as keyof typeof statusLabels]
            const StatusIcon = statusInfo?.icon || Clock

            return (
              <Card key={solution.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{solution.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${statusInfo?.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo?.label}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="mr-1 h-3 w-3" />
                          {solution.username || `用户 ${solution.userId}`}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          {solution.likes} 点赞
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openViewModal(solution)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditModal(solution)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {solution.status === 0 && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(solution.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(solution.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleDelete(solution.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {solution.content.substring(0, 200)}...
                    </div>
                    {solution.msg && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">审核备注:</p>
                        <p className="text-sm text-muted-foreground">{solution.msg}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div>题目ID: {solution.problemTitle || solution.problemId}</div>
                      <div className="flex items-center space-x-4">
                        <div>创建时间: {new Date(solution.createTime).toLocaleDateString()}</div>
                        <div>更新时间: {new Date(solution.updateTime).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>查看题解</DialogTitle>
          </DialogHeader>
          {viewingSolution && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{viewingSolution.title}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge
                    className={`${statusLabels[viewingSolution.status as keyof typeof statusLabels]?.color} text-white`}
                  >
                    {statusLabels[viewingSolution.status as keyof typeof statusLabels]?.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    作者: {viewingSolution.username || `用户 ${viewingSolution.userId}`}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4">
                <MarkdownRenderer content={viewingSolution.content} />
              </div>
              {viewingSolution.msg && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">审核备注:</p>
                  <p className="text-sm text-muted-foreground">{viewingSolution.msg}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑题解</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">题解标题</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">状态</Label>
              <Select
                value={editForm.status.toString()}
                onValueChange={(value) => setEditForm({ ...editForm, status: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">待审核</SelectItem>
                  <SelectItem value="1">已通过</SelectItem>
                  <SelectItem value="2">已拒绝</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">题解内容 (支持 Markdown)</Label>
              <Textarea
                id="edit-content"
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                rows={12}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-msg">审核备注</Label>
              <Textarea
                id="edit-msg"
                value={editForm.msg}
                onChange={(e) => setEditForm({ ...editForm, msg: e.target.value })}
                rows={3}
                placeholder="可选：添加审核意见或建议"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                更新题解
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
