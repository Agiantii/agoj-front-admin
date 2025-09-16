import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import { AdminNavigation } from "@/components/admin/navigation"
import "./globals.css"
const inter = Inter({ subsets: ["latin"] })
export const metadata: Metadata = {
  title: "LeetCode Admin - 管理员控制台",
  description: "编程题目管理和题解审核系统",
  generator: "v0.app",
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
      </head>
      <body className={inter.className}>
        <AdminNavigation></AdminNavigation>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
