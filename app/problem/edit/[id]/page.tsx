"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Upload } from "lucide-react"
import { getProblemDetail, updateProblem, uploadProblemCasesZip, type Problem } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { MarkdownRenderer } from "@/components/markdown-renderer"

export default function EditProblemPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const problemId = params.id as string

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: 1,
    timeLimit: 1000,
    memoryLimit: 256,
    status: 1,
    testInput: "",
    testOutput: "",
  })

  // 使用 useMemo 优化 Markdown 渲染性能
  const memoizedMarkdown = useMemo(() => {
    if (!formData.description.trim()) {
      return <p className="text-muted-foreground text-sm">暂无内容预览</p>
    }
    return <MarkdownRenderer content={formData.description} />
  }, [formData.description])

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await getProblemDetail(problemId)
        
        if (response.data) {
          const problem = response.data
          setFormData({
            title: problem.title || "",
            description: problem.description || "",
            difficulty: problem.difficulty || 1,
            timeLimit: problem.timeLimit || 1000,
            memoryLimit: problem.memoryLimit || 256,
            status: problem.status || 1,
            testInput: problem.testInput || "",
            testOutput: problem.testOutput || "",
          })
        } else {
          toast({
            title: "题目不存在",
            description: "未找到指定的题目",
            variant: "destructive",
          })
          router.push("/problem")
        }
      } catch (error) {
        console.error("获取题目详情失败:", error)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await updateProblem(problemId, formData)
      toast({
        title: "更新成功",
        description: "题目信息已成功更新",
      })
    } catch (error) {
      toast({
        title: "更新失败",
        description: "请检查输入信息或稍后重试",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".zip")) {
      toast({
        title: "文件格式错误",
        description: "请上传 ZIP 格式的测试用例文件",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      await uploadProblemCasesZip(problemId, file)
      toast({
        title: "上传成功",
        description: "测试用例已成功上传",
      })
    } catch (error) {
      toast({
        title: "上传失败",
        description: "请检查文件格式或稍后重试",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // 清空文件输入
      e.target.value = ""
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-bold">编辑题目</h1>
            <p className="text-muted-foreground mt-1">题目 ID: {problemId}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>编辑题目的基本信息</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">题目标题</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="输入题目标题"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">时间限制 (ms)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={formData.timeLimit}
                      onChange={(e) => setFormData({ ...formData, timeLimit: Number.parseInt(e.target.value) || 0 })}
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="memoryLimit">内存限制 (MB)</Label>
                    <Input
                      id="memoryLimit"
                      type="number"
                      value={formData.memoryLimit}
                      onChange={(e) => setFormData({ ...formData, memoryLimit: Number.parseInt(e.target.value) || 0 })}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">题目描述 (支持 Markdown)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="输入题目描述，支持 Markdown 格式"
                    rows={10}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testInput">示例输入</Label>
                  <Textarea
                    id="testInput"
                    value={formData.testInput}
                    onChange={(e) => setFormData({ ...formData, testInput: e.target.value })}
                    placeholder="输入示例测试用例的输入"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testOutput">示例输出</Label>
                  <Textarea
                    id="testOutput"
                    value={formData.testOutput}
                    onChange={(e) => setFormData({ ...formData, testOutput: e.target.value })}
                    placeholder="输入示例测试用例的输出"
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "保存中..." : "保存更改"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>测试用例</CardTitle>
              <CardDescription>上传 ZIP 格式的测试用例文件</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">选择 ZIP 文件上传测试用例</p>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="zip-upload"
                  />
                  <label htmlFor="zip-upload">
                    <Button variant="outline" disabled={uploading} asChild>
                      <span>{uploading ? "上传中..." : "选择文件"}</span>
                    </Button>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">ZIP 文件应包含输入文件 (*.in) 和对应的输出文件 (*.out)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>预览</CardTitle>
              <CardDescription>题目描述预览</CardDescription>
            </CardHeader>
            <CardContent>
              {memoizedMarkdown}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
