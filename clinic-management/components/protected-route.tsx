"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "patient" | "admin"
  redirectTo?: string
}

export function ProtectedRoute({ children, requiredRole, redirectTo = "/" }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
        return
      }

      if (requiredRole && user?.role !== requiredRole) {
        // Redirect based on user role
        if (user?.role === "admin") {
          router.push("/admin")
        } else if (user?.role === "patient") {
          router.push("/patient/dashboard")
        } else {
          router.push(redirectTo)
        }
        return
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}
