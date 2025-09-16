"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { login as apiLogin, register as apiRegister, type User } from "@/lib/api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (userData: { username: string; password: string; email: string; role?: string }) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth on mount
    const userInfo = localStorage.getItem("userInfo")

    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo)
        // 检查用户角色是否为 admin
        if (userData.role === 'admin') {
          setUser(userData)
        } else {
          localStorage.removeItem("userInfo")
        }
      } catch (error) {
        console.error("Failed to parse user info:", error)
        localStorage.removeItem("userInfo")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      console.log('开始登录:', username)
      const response = await apiLogin(username, password)
      console.log('登录响应:', response)
      
      // 检查响应格式和角色验证
      if ((response.code === 0 || response.code === 200)) {
        const userData = response
        console.log('用户数据:', userData)
        console.log('角色信息 - map.role:', response.map?.role, 'data.role:', userData.role)
        
        // 检查 map.role 或 data.role 是否为 admin
        if (response.map.role === 'admin' || userData.role === 'admin') {
          // 保存用户信息（不保存 token）
          localStorage.setItem("userInfo", JSON.stringify(userData))
          setUser(userData)
          console.log('登录成功，用户角色:', userData.role)
        } else {
          console.log('权限不足，角色:', userData.role)
          throw new Error("您没有管理员权限")
        }
      } else {
        console.log('响应状态码错误:', response.code)
        throw new Error(response.msg || "登录失败")
      }
    } catch (error) {
      console.error('登录异常:', error)
      throw error // 重新抛出异常，让上层处理
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: { username: string; password: string; email: string; role?: string }) => {
    setIsLoading(true)
    try {
      const response = await apiRegister(userData)
      if (response.code !== 0 && response.code !== 200) {
        throw new Error(response.msg || "注册失败")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("userInfo")
    setUser(null)
  }

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }
}
