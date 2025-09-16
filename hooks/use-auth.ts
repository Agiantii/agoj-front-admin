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
    const token = localStorage.getItem("token")
    const userInfo = localStorage.getItem("userInfo")

    if (token && userInfo) {
      try {
        setUser(JSON.parse(userInfo))
      } catch (error) {
        console.error("Failed to parse user info:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("userInfo")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await apiLogin(username, password)
      if (response.code === 0 || response.code === 200) {
        const { token, user: userData } = response.data
        localStorage.setItem("token", token)
        localStorage.setItem("userInfo", JSON.stringify(userData))
        setUser(userData)
      } else {
        throw new Error(response.msg || "登录失败")
      }
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
    localStorage.removeItem("token")
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
