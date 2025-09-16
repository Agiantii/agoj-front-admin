"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  searchProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  uploadProblemCasesZip,
  type ProblemBriefVo,
} from "@/lib/api"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Clock,
  HardDrive,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { MarkdownRenderer } from "@/components/markdown-renderer"

interface ProblemFormData {
  title: string
  description: string
  difficulty: number
  timeLimit: number
  memoryLimit: number
  status: number
  testInput: string
  testOutput: string
}

const difficultyLabels = {
  1: { label: "简单", color: "bg-green-500" },
  2: { label: "中等", color: "bg-yellow-500" },
  3: { label: "困难", color: "bg-red-500" },
}

const statusLabels = {
  0: { label: "草稿", color: "bg-gray-500" },
  1: { label: "已发布", color: "bg-green-500" },
  2: { label: "已下线", color: "bg-red-500" },
}

export function ProblemManagement() {
  const [problems, setProblems] = useState<ProblemBriefVo[]>([])
  const [loading, setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProblem, setEditingProblem] = useState<ProblemBriefVo | null>(null)
  const [formData, setFormData] = useState<ProblemFormData>({
    title: "",
    description: "",
    difficulty: 1,
    timeLimit: 1000,
    memoryLimit: 256,
    status: 0,
    testInput: "",
    testOutput: "",
  })
  const [uploadingFile, setUploadingFile] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadProblems()
  }, [])

  const loadProblems = async () => {
    setLoading(true)
    try {
      const response = await searchProblems({
        titleKeyword: searchKeyword,
        pageNum: 1,
        pageSize: 50,
      })
      if (response.code === 0 || response.code === 200) {
        setProblems(response.data.records || [])
      }
    } catch (error: any) {
      toast({
        title: "加载失败",
        description: error.message || "无法加载题目列表",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadProblems()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await createProblem(formData)
      if (response.code === 0 || response.code === 200) {
        toast({
          title: "创建成功",
          description: "题目已成功创建",
        })
        setShowCreateModal(false)
        resetForm()
        loadProblems()
      }
    } catch (error: any) {
      toast({
        title: "创建失败",
        description: error.message || "创建题目时出现错误",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProblem) return

    setLoading(true)
    try {
      const response = await updateProblem(editingProblem.id, formData)
      if (response.code === 0 || response.code === 200) {
        toast({
          title: "更新成功",
          description: "题目已成功更新",
        })
        setShowEditModal(false)
        setEditingProblem(null)
        resetForm()
        loadProblems()
      }
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message || "更新题目时出现错误",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (problemId: string) => {
    if (!confirm("确定要删除这个题目吗？此操作不可撤销。")) return

    try {
      const response = await deleteProblem(problemId)
      if (response.code === 0 || response.code === 200) {
        toast({
          title: "删除成功",
          description: "题目已成功删除",
        })
        loadProblems()
      }
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message || "删除题目时出现错误",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (problemId: string, file: File) => {
    setUploadingFile(problemId)
    try {
      const response = await uploadProblemCasesZip(problemId, file)
      if (response.code === 0 || response.code === 200) {
        toast({
          title: "上传成功",
          description: "测试用例已成功上传",
        })
      }
    } catch (error: any) {
      toast({
        title: "上传失败",
        description: error.message || "上传测试用例时出现错误",
        variant: "destructive",
      })
    } finally {
      setUploadingFile(null)
    }
  }

  const openEditModal = (problem: ProblemBriefVo) => {
    setEditingProblem(problem)
    setFormData({
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      status: problem.status,
      testInput: "",
      testOutput: "",
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      difficulty: 1,
      timeLimit: 1000,
      memoryLimit: 256,
      status: 0,
      testInput: "",
      testOutput: "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">题目管理</h1>
          <p className="text-muted-foreground mt-2">创建、编辑和管理编程题目</p>
        </div>

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              创建题目
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>创建新题目</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">题目标题</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">难度</Label>
                  <Select
                    value={formData.difficulty.toString()}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">简单</SelectItem>
                      <SelectItem value="2">中等</SelectItem>
                      <SelectItem value="3">困难</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">时间限制 (ms)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memoryLimit">内存限制 (MB)</Label>
                  <Input
                    id="memoryLimit"
                    type="number"
                    value={formData.memoryLimit}
                    onChange={(e) => setFormData({ ...formData, memoryLimit: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">状态</Label>
                  <Select
                    value={formData.status.toString()}
                    onValueChange={(value) => setFormData({ ...formData, status: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">草稿</SelectItem>
                      <SelectItem value="1">已发布</SelectItem>
                      <SelectItem value="2">已下线</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">题目描述 (支持 Markdown)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={8}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testInput">测试输入</Label>
                  <Textarea
                    id="testInput"
                    value={formData.testInput}
                    onChange={(e) => setFormData({ ...formData, testInput: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testOutput">测试输出</Label>
                  <Textarea
                    id="testOutput"
                    value={formData.testOutput}
                    onChange={(e) => setFormData({ ...formData, testOutput: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  创建题目
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Input
            placeholder="搜索题目标题..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="mr-2 h-4 w-4" />
          搜索
        </Button>
      </div>

      {/* Problems List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : problems.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">暂无题目</h3>
                <p className="mt-1 text-sm text-muted-foreground">开始创建您的第一个编程题目</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          problems.map((problem) => (
            <Card key={problem.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{problem.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge
                        className={`${difficultyLabels[problem.difficulty as keyof typeof difficultyLabels]?.color} text-white`}
                      >
                        {difficultyLabels[problem.difficulty as keyof typeof difficultyLabels]?.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${statusLabels[problem.status as keyof typeof statusLabels]?.color} text-white border-0`}
                      >
                        {statusLabels[problem.status as keyof typeof statusLabels]?.label}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {problem.timeLimit}ms
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <HardDrive className="mr-1 h-3 w-3" />
                        {problem.memoryLimit}MB
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFileUpload(problem.id, file)
                        }
                      }}
                      className="hidden"
                      id={`upload-${problem.id}`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById(`upload-${problem.id}`)?.click()}
                      disabled={uploadingFile === problem.id}
                    >
                      {uploadingFile === problem.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditModal(problem)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(problem.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <MarkdownRenderer content={problem.description} className="text-sm" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                        通过: {problem.acceptedCount}
                      </div>
                      <div className="flex items-center">
                        <XCircle className="mr-1 h-4 w-4 text-red-500" />
                        提交: {problem.submissionCount}
                      </div>
                    </div>
                    <div>创建时间: {new Date(problem.createTime).toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑题目</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">题目标题</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-difficulty">难度</Label>
                <Select
                  value={formData.difficulty.toString()}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">简单</SelectItem>
                    <SelectItem value="2">中等</SelectItem>
                    <SelectItem value="3">困难</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-timeLimit">时间限制 (ms)</Label>
                <Input
                  id="edit-timeLimit"
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: Number.parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-memoryLimit">内存限制 (MB)</Label>
                <Input
                  id="edit-memoryLimit"
                  type="number"
                  value={formData.memoryLimit}
                  onChange={(e) => setFormData({ ...formData, memoryLimit: Number.parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">状态</Label>
                <Select
                  value={formData.status.toString()}
                  onValueChange={(value) => setFormData({ ...formData, status: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">草稿</SelectItem>
                    <SelectItem value="1">已发布</SelectItem>
                    <SelectItem value="2">已下线</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">题目描述 (支持 Markdown)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={8}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-testInput">测试输入</Label>
                <Textarea
                  id="edit-testInput"
                  value={formData.testInput}
                  onChange={(e) => setFormData({ ...formData, testInput: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-testOutput">测试输出</Label>
                <Textarea
                  id="edit-testOutput"
                  value={formData.testOutput}
                  onChange={(e) => setFormData({ ...formData, testOutput: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                更新题目
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
