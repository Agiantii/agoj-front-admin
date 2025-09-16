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
import { usePathname } from "next/navigation"

interface NavigationProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function AdminNavigation({ activeTab, onTabChange }: NavigationProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedUserInfo = localStorage.getItem("userInfo")

    if (token && storedUserInfo) {
      try {
        const userData = JSON.parse(storedUserInfo)
        setIsLoggedIn(true)
        setUserInfo(userData)
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
    setIsLoggedIn(false)
    setUserInfo(null)
    localStorage.removeItem("token")
    localStorage.removeItem("userInfo")
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

                <Link href="/problem/create">
                  <Button variant="outline" className="flex items-center space-x-2 ml-4 bg-transparent">
                    <Plus className="h-4 w-4" />
                    <span>创建题目</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userInfo?.avatar_url || "/placeholder.svg"} alt={userInfo?.username} />
                        <AvatarFallback>{userInfo?.username?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{userInfo?.username}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{userInfo?.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>个人资料</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>设置</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
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
