import axios from "axios"
import JSONbig from "json-bigint"

const api_baseURL = "http://localhost:9090/api"
// const api_baseURL = process.env.NEXT_PUBLIC_API_BASE || "http://bc.agiantii.top:9090/api"

const request = axios.create({
  baseURL: api_baseURL,
  timeout: 10000,
  transformResponse: [(data) => JSONbig({ storeAsString: true }).parse(data)],
})

request.interceptors.request.use(
  (config) => {
    // 不再使用 token，只使用 userInfo
    const userInfo = localStorage.getItem("userInfo")
    if (userInfo) {
      const { id } = JSON.parse(userInfo)
      // 如果是需要userId的接口，自动添加
      if ((config as any).needUserId) {
        config.params = { ...config.params, userId: id }
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 根据状态码判断请求是否成功
    if (res.code === 0 || res.code === 200) {
      return res
    } else {
      console.error(res.msg || "操作失败")
      return Promise.reject(new Error(res.msg || "操作失败"))
    }
  },
  (error) => {
    // 处理HTTP错误
    const message = error.response?.data?.msg || "请求失败"
    console.error(message)

    // 如果是401错误，清除登录状态
    if (error.response?.status === 401) {
      localStorage.removeItem("userInfo")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  },
)

// ==================== 用户相关接口 ====================

export const login = (username: string, password: string) => {
  return request.post("/user/login", null, {
    params: { username: username, password: password },
  })
}

export const register = (userData: {
  username: string
  password: string
  email: string
  role?: string
  avatar_url?: string
}) => {
  return request.post("/user/add", userData)
}

// ==================== 题目相关接口 ====================

export const searchProblems = (params: {
  titleKeyword?: string
  descriptionKeyword?: string
  tagName?: string
  tagId?: string
  pageNum?: number
  pageSize?: number
}) => {
  return request.get("/problem/search", { params })
}
export const getProblemDetail = (problemId: string | number) => {
  return request.get("/problem/detail", { params: { problemId } })
}
export const createProblem = (problemData: {
  title: string
  description: string
  difficulty: number
  timeLimit: number
  memoryLimit: number
  status?: number
  testInput?: string
  testOutput?: string
}) => {
  return request.post("/problem/add", problemData)
}

export const updateProblem = (
  problemId: string | number,
  problemData: {
    id?: string | number
    title?: string
    description?: string
    difficulty?: number
    timeLimit?: number
    memoryLimit?: number
    status?: number
    testInput?: string
    testOutput?: string
  },
) => {
  // 确保请求数据中包含 id
  const dataWithId = {
    ...problemData,
    id: problemId,
  }
  return request.put(`/problem/update`, dataWithId)
}

export const deleteProblem = (problemId: string | number) => {
  return request.delete(`/problem/${problemId}`)
}

// ==================== 题目测试用例相关接口 ====================
// 获取题目测试用例 返回zip文件
export const getProblemCasesByZip = (problemId: string | number) => {
//get请求 不用request
return axios.get(`${api_baseURL}/problemCase/downloadZip`, {
  params: { problemId },
  responseType: "blob",
})
}
// 获取题目测试用例 
export const getProblemCases = (problemId: string | number) => {
  return request.get("problemCase/getProblemCases", { params: { problemId } })
}
export const uploadProblemCasesZip = (problemId: string | number, file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  return request.post("/problemCase/uploadZip", formData, {
    params: { problemId },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })
}

// ==================== 题解相关接口 ====================

export const searchSolutions = (params: {
  keyword: string
  visible: number
  pageNum: number
  pageSize: number
  problemId?: string
}) => {
  return request.get("/solution/search", { params })
}

export const approveSolution = (solutionId: string | number) => {
  return request.get("/solution/approve", { params: { solutionId } })
}

export const rejectSolution = (solutionId: string | number) => {
  return request.get("/solution/reject", { params: { solutionId } })
}

export const deleteSolution = (solutionId: string | number) => {
  return request.get("/solution/reject", { params: { solutionId } })
  // return request.delete(`/solution/${solutionId}`)
}

export const updateSolution = (
  solutionId: string | number,
  solutionData: {
    title?: string
    content?: string
    status?: number
    msg?: string
  },
) => {
  return request.put(`/solution/${solutionId}`, solutionData)
}

// ==================== 类型定义 ====================

export interface User {
  id: string
  username: string
  password?: string
  email: string
  role: string
  status: number
  createTime: string
  avatar_url?: string
}

export interface Problem {
  id: string
  title: string
  description: string
  difficulty: number
  timeLimit: number
  memoryLimit: number
  status: number
  createTime: string
  testInput?: string
  testOutput?: string
}

export interface Solution {
  id: string
  problemId: string
  userId: string
  title: string
  content: string
  createTime: string
  updateTime: string
  likes: number
  status: number
  msg?: string
}

export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
  map?: Record<string, any>
}

export default request
