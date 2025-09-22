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

// Mock user database (in production, this would be a real database)
const mockUsers = {
  patients: [
    {
      id: "1",
      patientId: "HC001",
      password: "patient123",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "patient" as const,
    },
    {
      id: "2",
      patientId: "HC002",
      password: "patient456",
      name: "Robert Brown",
      email: "robert@example.com",
      role: "patient" as const,
    },
  ],
  admins: [
    {
      id: "admin1",
      username: "admin",
      password: "admin123",
      name: "Dr. Admin",
      email: "admin@clinic.com",
      role: "admin" as const,
    },
  ],
}

export const authService = {
  // Patient login
  loginPatient: async (patientId: string, password: string): Promise<User | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call

    const patient = mockUsers.patients.find((p) => p.patientId === patientId && p.password === password)

    if (patient) {
      const user: User = {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        role: patient.role,
        patientId: patient.patientId,
      }

      // Store in localStorage (in production, use secure tokens)
      localStorage.setItem("auth_user", JSON.stringify(user))
      localStorage.setItem("auth_token", `patient_${patient.id}`)

      return user
    }

    return null
  },

  // Admin login
  loginAdmin: async (username: string, password: string): Promise<User | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call

    const admin = mockUsers.admins.find((a) => a.username === username && a.password === password)

    if (admin) {
      const user: User = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      }

      // Store in localStorage (in production, use secure tokens)
      localStorage.setItem("auth_user", JSON.stringify(user))
      localStorage.setItem("auth_token", `admin_${admin.id}`)

      return user
    }

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
