import { apiClient } from '@/shared/utils/apiClient'
import { API_CONFIG } from '@/shared/config/api.config'
import { User } from '@/shared/types/dashboard'

interface LoginRequest {
  identifier: string
  password: string
}

interface AuthResponse {
  token: string
  type: string
  user: User
}

interface LoginResponse {
  success: boolean
  message: string
  data: AuthResponse | null
}

interface SignupRequest {
  password: string
  email: string
  fullName: string
  phone?: string
  company?: string
}

interface SignupResponse {
  success: boolean
  message: string
  data: AuthResponse | null
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
}

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

const canUseStorage = (): boolean => typeof window !== 'undefined'

const persistAuth = (auth: AuthResponse, remember = true) => {
  if (!canUseStorage()) return
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, auth.token)
  storage.setItem(USER_KEY, JSON.stringify(auth.user))
}

const clearAuth = () => {
  if (!canUseStorage()) return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

const readToken = (): string | null => {
  if (!canUseStorage()) return null
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)
}

const readUser = (): string | null => {
  if (!canUseStorage()) return null
  return sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY)
}

const getActiveStorage = (): Storage => {
  if (!canUseStorage()) {
    throw new Error('Storage is only available in the browser')
  }
  return sessionStorage.getItem(TOKEN_KEY) ? sessionStorage : localStorage
}

export const authService = {
  login: async (identifier: string, password: string, remember = true): Promise<LoginResponse> => {
    try {
      // Skip auth for login endpoint
      const response = await apiClient.post(API_CONFIG.AUTH.LOGIN, 
        { identifier, password } satisfies LoginRequest,
        { skipAuth: true }
      )

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Login failed',
          data: null,
        }
      }

      // Save token and user to localStorage
      if (data.success && data.data) {
        persistAuth(data.data, remember)
      }

      return {
        success: data.success,
        message: data.message,
        data: data.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        data: null,
      }
    }
  },

  logout: () => {
    clearAuth()
  },

  getToken: () => {
    return readToken()
  },

  getUser: (): User | null => {
    const user = readUser()
    if (!user) return null
    try {
      return JSON.parse(user) as User
    } catch {
      return null
    }
  },

  isAuthenticated: () => {
    return !!readToken()
  },

  register: async (email: string, fullName: string, password: string, phone?: string, company?: string): Promise<SignupResponse> => {
    try {
      // Skip auth for register endpoint
      const response = await apiClient.post(API_CONFIG.AUTH.REGISTER,
        { email, fullName, password, phone, company } as SignupRequest,
        { skipAuth: true }
      )

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Registration failed',
          data: null,
        }
      }

      // Save token and user to localStorage
      if (data.success && data.data) {
        persistAuth(data.data)
      }

      return {
        success: data.success,
        message: data.message,
        data: data.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        data: null,
      }
    }
  },

  // Helper function to get authorization header
  getAuthHeader: (): Record<string, string> => {
    const token = authService.getToken()
    return token ? { Authorization: `Bearer ${token}` } : ({} as Record<string, string>)
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    try {
      // apiClient will automatically handle 401 and logout
      const response = await apiClient.get(API_CONFIG.AUTH.ME)

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Unable to fetch current user',
          data: null,
        }
      }

      if (result?.data && canUseStorage()) {
        const storage = getActiveStorage()
        storage.setItem(USER_KEY, JSON.stringify(result.data))
      }

      return {
        success: result.success,
        message: result.message,
        data: result.data,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        data: null,
      }
    }
  },

  updateProfile: async (_userId: number, _data: Partial<User>): Promise<ApiResponse<User>> => ({
    success: false,
    message: 'Profile updates are not available yet. Contact an administrator to change your account.',
    data: null,
  }),
}
 
