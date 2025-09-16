"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/admin/auth-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Code, FileText, Home, LogOut, Settings, User, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createProblem } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface NavigationProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function AdminNavigation({ activeTab, onTabChange }: NavigationProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // 根据简化登录规范，只检查 userInfo，不使用 token
    const storedUserInfo = localStorage.getItem("userInfo")

    if (storedUserInfo) {
      try {
        const userData = JSON.parse(storedUserInfo)
        // 检查用户角色是否为 admin
        if (userData.role === 'admin') {
          setIsLoggedIn(true)
          setUserInfo(userData)
        } else {
          // 如果不是 admin，清除信息
          handleLogout()
        }
      } catch (error) {
        console.error("Failed to parse user info:", error)
        handleLogout()
      }
    }
  }, [])

  const handleLogin = (userData: any) => {
    setIsLoggedIn(true)
    setUserInfo(userData)
    setShowAuthModal(false)
  }

  const handleLogout = () => {
    // 清除登录状态
    setIsLoggedIn(false)
    setUserInfo(null)
    
    // 清除本地存储的用户信息
    localStorage.removeItem("userInfo")
    
    // 可选：反馈给用户
    console.log('用户已退出登录')
  }

  // 创建空题目并跳转到编辑页面
  const handleCreateProblem = async () => {
    if (!isLoggedIn) {
      toast({
        title: "需要登录",
        description: "请先登录后再创建题目",
        variant: "destructive",
      })
      setShowAuthModal(true)
      return
    }

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

      if (response.data) {
        toast({
          title: "创建成功",
          description: "正在跳转到编辑页面...",
        })
        // 跳转到编辑页面
        router.push(`/problem/edit/${response.data}`)
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

  const navItems = [
    { id: "dashboard", label: "控制台", icon: Home, href: "/" },
    { id: "problems", label: "题目", icon: FileText, href: "/problem" },
    { id: "solutions", label: "题解审核", icon: FileText, href: "/solution" },
  ]

  return (
    <>
      <nav className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <Code className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">LeetCode Admin</span>
              </Link>

              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.id} href={item.href}>
                      <Button variant={isActive ? "secondary" : "ghost"} className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  )
                })}

                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 ml-4 bg-transparent" 
                  onClick={handleCreateProblem}
                  disabled={isCreating}
                >
                  <Plus className="h-4 w-4" />
                  <span>{isCreating ? "创建中..." : "创建题目"}</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 w-10 rounded-full hover:bg-accent transition-colors"
                    >
                      <Avatar className="h-10 w-10 border-2 border-muted-foreground/20 hover:border-primary/50 transition-colors">
                        <AvatarImage 
                          src={userInfo?.avatar_url || userInfo?.avatarUrl} 
                          alt={userInfo?.username || '用户'}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {userInfo?.username?.charAt(0).toUpperCase() || "A"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" sideOffset={5}>
                    <div className="flex items-center justify-start gap-3 p-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={userInfo?.avatar_url || userInfo?.avatarUrl} 
                          alt={userInfo?.username || '用户'}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                          {userInfo?.username?.charAt(0).toUpperCase() || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-base">{userInfo?.username || '未知用户'}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                          {userInfo?.email || '未设置邮箱'}
                        </p>
                        <p className="text-xs text-primary font-medium">
                          管理员
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer hover:bg-accent focus:bg-accent">
                      <User className="mr-3 h-4 w-4" />
                      <span>个人资料</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-accent focus:bg-accent">
                      <Settings className="mr-3 h-4 w-4" />
                      <span>设置</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer hover:bg-destructive/10 text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>退出登录</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setShowAuthModal(true)}>登录 / 注册</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} onLogin={handleLogin} />
    </>
  )
}
