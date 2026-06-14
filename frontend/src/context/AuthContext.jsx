import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('sl_token')
    if (token) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/v1/user/profile')
      setUser(data)
      setIsAuthenticated(true)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      localStorage.removeItem('sl_token')
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/v1/auth/login', { username, password })
    localStorage.setItem('sl_token', data.access_token)
    setUser(data.user)
    setIsAuthenticated(true)
    return data
  }, [])

  const register = useCallback(async (username, email, password) => {
    const { data } = await api.post('/v1/auth/register', { username, email, password })
    localStorage.setItem('sl_token', data.access_token)
    setUser(data.user)
    setIsAuthenticated(true)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sl_token')
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({ ...prev, ...updates }))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
