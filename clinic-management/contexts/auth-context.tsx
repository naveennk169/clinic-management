"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authService, type User, type AuthState } from "@/lib/auth"

interface AuthContextType extends AuthState {
  login: (credentials: {
    patientId?: string
    username?: string
    password: string
    role: "patient" | "admin"
  }) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Check for existing authentication on mount
    const user = authService.getCurrentUser()
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: !!user,
    })
  }, [])

  const login = async (credentials: {
    patientId?: string
    username?: string
    password: string
    role: "patient" | "admin"
  }): Promise<boolean> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      let user: User | null = null

      if (credentials.role === "patient" && credentials.patientId) {
        user = await authService.loginPatient(credentials.patientId, credentials.password)
      } else if (credentials.role === "admin" && credentials.username) {
        user = await authService.loginAdmin(credentials.username, credentials.password)
      }

      if (user) {
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
        return true
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const logout = () => {
    authService.logout()
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  return <AuthContext.Provider value={{ ...authState, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
