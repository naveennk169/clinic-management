"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function PatientLoginPage() {
  const [credentials, setCredentials] = useState({
    patientId: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: credentials.patientId,
          password: credentials.password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Store patient data in localStorage for session management
        localStorage.setItem("patient_session", JSON.stringify(result.patient))

        toast({
          title: "Login Successful",
          description: "Welcome back! Redirecting to your dashboard...",
        })
        router.push("/patient/dashboard")
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid patient ID or password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">Surya's Speech and Language Clinic</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Patient Login</CardTitle>
            <CardDescription>Enter your patient ID and password to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  value={credentials.patientId}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, patientId: e.target.value }))}
                  placeholder="Enter your patient ID (e.g., P001)"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login to Dashboard"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">Don't have login credentials yet?</p>
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-sm mb-2">How to get your login credentials:</h4>
                <ol className="text-xs text-muted-foreground space-y-1 text-left">
                  <li>1. Book your first appointment using our booking form</li>
                  <li>2. Visit our clinic for your consultation</li>
                  <li>3. Our staff will create your patient account</li>
                  <li>4. You'll receive your Patient ID and password</li>
                </ol>
              </div>

              <div className="mt-4">
                <Link href="/book-appointment">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Book Your First Appointment
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
