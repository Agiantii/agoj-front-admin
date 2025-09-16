"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, ArrowLeft, Save } from "lucide-react"
import { createProblem, uploadProblemCasesZip } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export default function CreateProblemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: 1,
    timeLimit: 1000,
    memoryLimit: 256,
    testInput: "",
    testOutput: "",
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleZipUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/zip") {
      setZipFile(file)
    } else {
      toast({
        title: "文件格式错误",
        description: "请上传ZIP格式的测试用例文件",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      toast({
        title: "表单验证失败",
        description: "请填写题目标题和描述",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await createProblem(formData)
      const problemId = response.data.id

      if (zipFile && problemId) {
        await uploadProblemCasesZip(problemId, zipFile)
      }

      toast({
        title: "创建成功",
        description: "题目已成功创建",
      })

      router.push("/")
    } catch (error: any) {
      toast({
        title: "创建失败",
        description: error.message || "创建题目时发生错误",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <h1 className="text-3xl font-bold">创建新题目</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>填写题目的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">题目标题</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="请输入题目标题"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">题目描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="请输入题目描述，支持Markdown格式"
                  rows={8}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="difficulty">难度等级</Label>
                  <Select
                    value={formData.difficulty.toString()}
                    onValueChange={(value) => handleInputChange("difficulty", Number.parseInt(value))}
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

                <div>
                  <Label htmlFor="timeLimit">时间限制 (ms)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => handleInputChange("timeLimit", Number.parseInt(e.target.value))}
                    min="100"
                    max="10000"
                  />
                </div>

                <div>
                  <Label htmlFor="memoryLimit">内存限制 (MB)</Label>
                  <Input
                    id="memoryLimit"
                    type="number"
                    value={formData.memoryLimit}
                    onChange={(e) => handleInputChange("memoryLimit", Number.parseInt(e.target.value))}
                    min="64"
                    max="1024"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>示例测试用例</CardTitle>
              <CardDescription>提供一个示例输入输出，帮助用户理解题目</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testInput">示例输入</Label>
                <Textarea
                  id="testInput"
                  value={formData.testInput}
                  onChange={(e) => handleInputChange("testInput", e.target.value)}
                  placeholder="请输入示例输入"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="testOutput">示例输出</Label>
                <Textarea
                  id="testOutput"
                  value={formData.testOutput}
                  onChange={(e) => handleInputChange("testOutput", e.target.value)}
                  placeholder="请输入示例输出"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>测试用例文件</CardTitle>
              <CardDescription>上传包含所有测试用例的ZIP文件</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <Label htmlFor="zipFile" className="cursor-pointer">
                      <span className="text-sm font-medium text-primary hover:text-primary/80">点击上传ZIP文件</span>
                      <Input id="zipFile" type="file" accept=".zip" onChange={handleZipUpload} className="hidden" />
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">支持ZIP格式，包含输入输出文件对</p>
                  </div>
                  {zipFile && (
                    <div className="mt-4 p-2 bg-muted rounded">
                      <p className="text-sm">已选择: {zipFile.name}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "创建中..." : "创建题目"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
