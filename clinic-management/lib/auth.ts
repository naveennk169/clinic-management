"use client"

// Authentication utilities and types
export interface User {
  id: string
  name: string
  email: string
  role: "patient" | "admin"
  patientId?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

import { prisma } from "./prisma"

// In a real application, you'd use iron-session or next-auth.
// Here we simulate checking DB since we don't have a real edge/session middleware.
export const authService = {
  // Patient login (Simulate fetching via a server action or API)
  loginPatient: async (patientId: string, password: string): Promise<User | null> => {
    try {
      // In a real App Router app with "use client", you'd fetch an API route. 
      // We will create an /api/auth route to handle this securely.
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "patient", patientId, password })
      })
      const data = await res.json()

      if (data.success && data.user) {
        localStorage.setItem("auth_user", JSON.stringify(data.user))
        localStorage.setItem("auth_token", `patient_${data.user.id}`)
        return data.user
      }
    } catch(e) { console.error(e) }
    return null
  },

  // Admin login
  loginAdmin: async (username: string, password: string): Promise<User | null> => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "admin", username, password })
      })
      const data = await res.json()

      if (data.success && data.user) {
        localStorage.setItem("auth_user", JSON.stringify(data.user))
        localStorage.setItem("auth_token", `admin_${data.user.id}`)
        return data.user
      }
    } catch(e) { console.error(e) }
    return null
  },

  // Get current user from storage
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null

    try {
      const userStr = localStorage.getItem("auth_user")
      const token = localStorage.getItem("auth_token")

      if (userStr && token) {
        return JSON.parse(userStr)
      }
    } catch (error) {
      console.error("Error getting current user:", error)
    }

    return null
  },

  // Logout
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user")
      localStorage.removeItem("auth_token")
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false

    const token = localStorage.getItem("auth_token")
    return !!token
  },
}
