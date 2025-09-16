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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Upload, Download, Eye, RefreshCw } from "lucide-react"
import { getProblemDetail, updateProblem, uploadProblemCasesZip, getProblemCases, getProblemCasesByZip, type Problem } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { MarkdownRenderer } from "@/components/markdown-renderer"

export default function EditProblemPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [testCases, setTestCases] = useState<any[]>([])
  const [loadingCases, setLoadingCases] = useState(false)
  const [dragActive, setDragActive] = useState(false)

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

  // 获取测试用例
  const fetchTestCases = async () => {
    if (!problemId) return
    setLoadingCases(true)
    try {
      const response = await getProblemCases(problemId)
      if (response.data) {
        setTestCases(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error("获取测试用例失败:", error)
      toast({
        title: "获取测试用例失败",
        description: "该题目前暂无测试样例",
        variant: "destructive",
      })
    } finally {
      setLoadingCases(false)
    }
  }

  // 在组件加载时获取测试用例
  useEffect(() => {
    if (problemId && !loading) {
      fetchTestCases()
    }
  }, [problemId, loading])

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

    await uploadZipFile(file)
    // 清空文件输入
    e.target.value = ""
  }

  // ZIP 文件上传函数
  const uploadZipFile = async (file: File) => {
    setUploading(true)
    try {
      await uploadProblemCasesZip(problemId, file)
      toast({
        title: "上传成功",
        description: "测试用例已成功上传，正在刷新列表...",
      })
      // 重新获取测试用例
      await fetchTestCases()
    } catch (error) {
      toast({
        title: "上传失败",
        description: "请检查文件格式或稍后重试",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // 处理拖拽事件
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    const zipFile = files.find(file => file.name.endsWith(".zip"))
    
    if (zipFile) {
      uploadZipFile(zipFile)
    } else {
      toast({
        title: "文件格式错误",
        description: "请拖拽 ZIP 格式的测试用例文件",
        variant: "destructive",
      })
    }
  }

  // 下载测试用例 ZIP 文件
  const handleDownloadCases = async () => {
    setDownloading(true)
    try {
      const response = await getProblemCasesByZip(problemId)
      
      // 直接使用响应数据，已经是 Blob 类型
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `problem-${problemId}-testcases.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "下载成功",
        description: "测试用例 ZIP 文件已下载",
      })
    } catch (error) {
      console.error("下载测试用例失败:", error)
      toast({
        title: "下载失败",
        description: "请检查网络连接或稍后重试",
        variant: "destructive",
      })
    } finally {
      setDownloading(false)
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>测试用例管理</CardTitle>
                  <CardDescription>上传 ZIP 格式的测试用例文件，支持拖拽上传</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadCases}
                    disabled={downloading || testCases.length === 0}
                  >
                    {downloading ? (
                      <Download className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span className="ml-2">下载 ZIP</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchTestCases}
                    disabled={loadingCases}
                  >
                    {loadingCases ? (
                      <Upload className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 拖拽上传区域 */}
                <div
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center transition-colors
                    ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }
                    ${uploading ? "pointer-events-none opacity-50" : ""}
                  `}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      {uploading ? (
                        <Upload className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">
                        {dragActive ? "释放文件以上传" : "拖拽 ZIP 文件到此处"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        或者点击下方按钮选择文件
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <input
                        type="file"
                        accept=".zip"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="zip-upload"
                      />
                      <label htmlFor="zip-upload">
                        <Button
                          variant="outline"
                          disabled={uploading}
                          asChild
                        >
                          <span>
                            {uploading ? "上传中..." : "选择 ZIP 文件"}
                          </span>
                        </Button>
                      </label>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      ZIP 文件应包含输入文件 (*.in) 和对应的输出文件 (*.out)
                    </p>
                  </div>
                </div>

                {/* 测试用例列表 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      测试用例列表
                      <Badge variant="secondary" className="ml-2">
                        {testCases.length} 个用例
                      </Badge>
                    </h4>
                  </div>

                  {loadingCases ? (
                    <div className="flex items-center justify-center py-8">
                      <Upload className="h-6 w-6 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">加载中...</span>
                    </div>
                  ) : testCases.length > 0 ? (
                    <div className="grid gap-3 max-h-96 overflow-y-auto">
                      {testCases.map((testCase, index) => (
                        <Card key={testCase.id || index} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Badge variant="outline">
                                  用例 {index + 1}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  输入: {testCase.input?.length || 0} 字符
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  输出: {testCase.output?.length || 0} 字符
                                </span>
                              </div>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    查看详情
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh]">
                                  <DialogHeader>
                                    <DialogTitle>测试用例 {index + 1} 详情</DialogTitle>
                                  </DialogHeader>
                                  <ScrollArea className="h-[60vh]">
                                    <div className="space-y-4">
                                      <div>
                                        <h5 className="font-medium mb-2">输入数据</h5>
                                        <Card>
                                          <CardContent className="p-3">
                                            <pre className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                                              {testCase.input || "无输入数据"}
                                            </pre>
                                          </CardContent>
                                        </Card>
                                      </div>
                                      
                                      <div>
                                        <h5 className="font-medium mb-2">期望输出</h5>
                                        <Card>
                                          <CardContent className="p-3">
                                            <pre className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                                              {testCase.output || "无输出数据"}
                                            </pre>
                                          </CardContent>
                                        </Card>
                                      </div>
                                    </div>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>暂无测试用例</p>
                      <p className="text-sm">请上传 ZIP 文件添加测试用例</p>
                    </div>
                  )}
                </div>
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
