"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Heart,
  Calendar,
  User,
  LogOut,
  Clock,
  FileText,
  Download,
  ExternalLink,
  DollarSign,
  CreditCard,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface PatientData {
  patientId: string
  name: string
  email: string
  phone: string
  totalSessions: number
  completedSessions: number
  therapyDetails: string
  createdAt: string
  status: string
  paidAmount: number
  sessionCost: number
  paymentType: "advance" | "per-session"
  paymentDate?: string
  balance: number
  nextSessionDate: string
}

export default function PatientDashboard() {
  const [patient, setPatient] = useState<PatientData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const fetchPatientData = async (patientId: string) => {
    try {
      const response = await fetch("/api/patients")
      const data = await response.json()
      const currentPatient = data.patients.find((p: any) => p.patientId === patientId)
      if (currentPatient) {
        setPatient(currentPatient)
        // Update localStorage with latest data
        localStorage.setItem("patient_session", JSON.stringify(currentPatient))
      }
    } catch (error) {
      console.error("Error fetching patient data:", error)
    }
  }

  useEffect(() => {
    // Check if patient is logged in
    const patientSession = localStorage.getItem("patient_session")
    if (!patientSession) {
      router.push("/patient/login")
      return
    }

    try {
      const patientData = JSON.parse(patientSession)
      setPatient(patientData)
      fetchPatientData(patientData.patientId)
    } catch (error) {
      console.error("Error parsing patient session:", error)
      router.push("/patient/login")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("patient_session")
    router.push("/")
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle>Loading Dashboard...</CardTitle>
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

  if (!patient) {
    return null
  }

  const progressPercentage = patient.totalSessions > 0 ? (patient.completedSessions / patient.totalSessions) * 100 : 0
  const remainingSessions = Math.max(0, patient.totalSessions - patient.completedSessions)
  const totalTreatmentCost = (patient.totalSessions || 0) * (patient.sessionCost || 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Surya's Speech and Language Clinic</h1>
                <p className="text-xs text-muted-foreground">Patient Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">
                <User className="h-3 w-3 mr-1" />
                {patient.patientId}
              </Badge>
              <Badge variant="outline">Welcome, {patient.name}</Badge>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {patient.name}!</h2>
          <p className="text-muted-foreground">Here's an overview of your treatment progress and session details.</p>
        </div>

        {/* Patient Details Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Details
            </CardTitle>
            <CardDescription>Your personal information and therapy plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Patient ID</Label>
                  <p className="font-semibold">{patient.patientId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="font-semibold">{patient.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p>{patient.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p>{patient.phone}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                  <p>{new Date(patient.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
                  <Badge variant={patient.status === "active" ? "default" : "secondary"}>{patient.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Next Session</Label>
                  <p>
                    {patient.nextSessionDate ? new Date(patient.nextSessionDate).toLocaleDateString() : "Not scheduled"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Payment Date</Label>
                  <p>
                    {patient.paymentDate ? patient.paymentDate : "No payment record"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Therapy Plan</Label>
                  <p className="text-sm leading-relaxed">{patient.therapyDetails || "No therapy details available"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Statistics */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patient.totalSessions || 0}</div>
              <p className="text-xs text-muted-foreground">Prescribed sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patient.completedSessions || 0}</div>
              <p className="text-xs text-muted-foreground">Sessions completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{remainingSessions}</div>
              <p className="text-xs text-muted-foreground">Sessions left</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{patient.paidAmount?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">Total paid</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Treatment Progress</CardTitle>
            <CardDescription>Your therapy session completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Sessions Completed</span>
                <span>
                  {patient.completedSessions || 0} of {patient.totalSessions || 0}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Started: {new Date(patient.createdAt).toLocaleDateString()}</span>
                <span>{remainingSessions} sessions remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Home Workout Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Home Workout Plan
            </CardTitle>
            <CardDescription>Your personalized exercise routine and instructions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Current Workout Plan</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Your therapist has provided a customized workout plan to support your recovery and maintain progress
                  between sessions.
                </p>

                {/* Sample workout content - in production this would come from Google Sheets */}
                <div className="space-y-3">
                  <div className="border-l-4 border-primary pl-4">
                    <h5 className="font-medium">Daily Exercises</h5>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Gentle stretching routine (10 minutes)</li>
                      <li>• Core strengthening exercises (15 minutes)</li>
                      <li>• Balance and coordination drills (10 minutes)</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-accent pl-4">
                    <h5 className="font-medium">Weekly Goals</h5>
                    <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                      <li>• Complete exercises 5 days per week</li>
                      <li>• Track pain levels and mobility improvements</li>
                      <li>• Gradually increase exercise duration</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Watch Video Guide
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>
                  <strong>Note:</strong> Always follow your therapist's instructions. If you experience any pain or
                  discomfort, stop the exercises and contact our clinic immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Label({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <label className={`text-sm font-medium ${className || ""}`} {...props}>
      {children}
    </label>
  )
}
