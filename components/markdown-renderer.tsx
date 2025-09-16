"use client"

import { useState, useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { CheckCircle } from "lucide-react"

interface MarkdownRendererProps {
  content: string
  className?: string
}

// 复制按钮组件
const CopyButton = ({ code }: { code: string }) => {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  return (
    <button
      onClick={copyToClipboard}
      className="absolute right-2 top-2 p-1 rounded hover:bg-gray-700 focus:outline-none"
      aria-label="Copy code"
    >
      {isCopied ? (
        <CheckCircle className="h-4 w-4 text-green-400" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  )
}

// Markdown 渲染器组件
export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  // 使用 useMemo 优化插件配置，避免重复创建
  const remarkPlugins = useMemo(() => [remarkMath], [])
  const rehypePlugins = useMemo(() => [
    [rehypeKatex, {
      strict: false,
      trust: true,
      output: 'html'
    }] as any
  ], [])

  // 使用 useMemo 优化组件配置
  const components = useMemo(() => ({
    code({ node, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "")
      const code = String(children).replace(/\n$/, "")

      // 检查是否为内联代码
      const isInline = !match && !code.includes('\n')

      if (isInline) {
        return (
          <code className={`bg-muted px-1 py-0.5 rounded text-sm ${className || ''}`} {...props}>
            {children}
          </code>
        )
      }

      return (
        <div className="relative my-4">
          <div className="absolute right-2 top-2 z-10">
            <CopyButton code={code} />
          </div>
          <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto">
            <code className={match ? `language-${match[1]}` : "language-text"}>{code}</code>
          </pre>
        </div>
      )
    },
    // 优化数学公式的处理
    div({ className, children, ...props }: any) {
      if (className?.includes('katex-display')) {
        return (
          <div className={`my-4 ${className}`} {...props}>
            {children}
          </div>
        )
      }
      return <div className={className} {...props}>{children}</div>
    }
  }), [])

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer
