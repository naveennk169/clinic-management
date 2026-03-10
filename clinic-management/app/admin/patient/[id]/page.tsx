"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, User, Calendar, CreditCard, Activity, CheckCircle, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

function PatientDetailsContent() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const patientId = params.id as string

  const [patient, setPatient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Form states
  const [totalSessions, setTotalSessions] = useState("")
  const [completedSessions, setCompletedSessions] = useState("")
  const [therapyDetails, setTherapyDetails] = useState("")
  const [paidAmount, setPaidAmount] = useState("")
  const [sessionCost, setSessionCost] = useState("")
  const [paymentType, setPaymentType] = useState<"advance" | "per-session">("advance")
  const [paymentDate, setPaymentDate] = useState("")
  const [nextSessionDate, setNextSessionDate] = useState("")

  useEffect(() => {
    loadPatientData()
  }, [patientId])

  const loadPatientData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/patients/${patientId}`)
      if (response.ok) {
        const data = await response.json()
        const p = data.patient
        setPatient(p)
        
        // Initialize form
        setTotalSessions(p.totalSessions?.toString() || "0")
        setCompletedSessions(p.completedSessions?.toString() || "0")
        setTherapyDetails(p.therapyDetails || "")
        setPaidAmount(p.paidAmount?.toString() || "0")
        setSessionCost(p.sessionCost?.toString() || "0")
        setPaymentType(p.paymentType || "advance")
        setPaymentDate(p.paymentDate || "")
        setNextSessionDate(p.nextSessionDate || "")
      } else {
        toast({
          title: "Error",
          description: "Patient not found or failed to load",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Failed to fetch patient:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePatient = async () => {
    if (!patient) return

    try {
      const cost = parseFloat(sessionCost) || 0
      const paid = parseFloat(paidAmount) || 0
      const total = parseInt(totalSessions) || 0
      const completed = parseInt(completedSessions) || 0

      // Calculate balance based on payment type
      let newBalance = 0
      if (paymentType === "per-session") {
        const totalDue = completed * cost
        newBalance = totalDue - paid
      } else {
        const totalDue = total * cost
        newBalance = totalDue - paid
      }

      const updateData = {
        totalSessions: total,
        completedSessions: completed,
        therapyDetails,
        sessionCost: cost,
        paidAmount: paid,
        paymentType,
        paymentDate,
        balance: newBalance,
        nextSessionDate,
      }

      const response = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Patient details updated successfully." })
        loadPatientData()
      } else {
        throw new Error("Update failed")
      }
    } catch (error) {
      console.error("Error updating patient:", error)
      toast({ title: "Update Failed", description: "Unable to update patient information.", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Patient Not Found</h2>
        <Button onClick={() => router.push("/admin")}>Return to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Patient Profile</h1>
              <p className="text-xs text-muted-foreground">{patient.patientId}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Main Info Card */}
          <Card className="md:col-span-1 border-primary/20 shadow-sm">
            <CardHeader className="bg-primary/5 pb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <User className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl">{patient.name}</CardTitle>
              <CardDescription className="text-base">{patient.email}</CardDescription>
              <div className="mt-2">
                <Badge variant={patient.status === "active" ? "default" : "secondary"}>
                  {patient.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Phone Number</Label>
                <p className="font-medium">{patient.phone || "N/A"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Internal Patient ID</Label>
                <p className="font-mono text-sm">{patient.patientId}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Joined Date</Label>
                <p className="font-medium">{new Date(patient.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Metrics */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Therapy Progress</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patient.completedSessions} / {patient.totalSessions || "?"}</div>
                <p className="text-xs text-muted-foreground mt-1">Sessions Completed</p>
                {patient.therapyDetails && (
                  <p className="text-xs mt-3 pt-3 border-t font-medium text-balance">
                    {patient.therapyDetails}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">₹{patient.paidAmount?.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground mt-1">Total Paid</p>
                <div className="flex justify-between items-center mt-3 border-t pt-3">
                  <span className="text-xs text-muted-foreground">{patient.paymentDate ? `Paid on ${patient.paymentDate}` : "No payment date"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2 sm:col-span-1">
               <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{patient.nextSessionDate || "Not Scheduled"}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Treatment & Billing</CardTitle>
            <CardDescription>Update session tracking and payment details for this patient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Treatment Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
                  <Activity className="h-4 w-4 text-primary" /> Session Tracking
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="therapyDetails">Therapy Details</Label>
                    <Input
                      id="therapyDetails"
                      value={therapyDetails}
                      onChange={(e) => setTherapyDetails(e.target.value)}
                      placeholder="e.g., Physical therapy for lower back pain"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="totalSessions">Total Recommended</Label>
                      <Input
                        id="totalSessions"
                        type="number"
                        value={totalSessions}
                        onChange={(e) => setTotalSessions(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="completedSessions">Completed</Label>
                      <Input
                        id="completedSessions"
                        type="number"
                        value={completedSessions}
                        onChange={(e) => setCompletedSessions(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="nextSessionDate">Next Scheduled Date</Label>
                    <Input
                      id="nextSessionDate"
                      type="date"
                      value={nextSessionDate}
                      onChange={(e) => setNextSessionDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Billing Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 border-b pb-2">
                  <CreditCard className="h-4 w-4 text-primary" /> Billing & Payments
                </h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="paymentType">Payment Plan</Label>
                      <Select value={paymentType} onValueChange={(value: "advance" | "per-session") => setPaymentType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="advance">Paid in Advance</SelectItem>
                          <SelectItem value="per-session">Pay Per Session</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sessionCost">Cost Per Session (₹)</Label>
                      <Input
                        id="sessionCost"
                        type="number"
                        step="0.01"
                        value={sessionCost}
                        onChange={(e) => setSessionCost(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="paidAmount">Total Amount Received (₹)</Label>
                    <Input
                      id="paidAmount"
                      type="number"
                      step="0.01"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="text-lg font-bold"
                    />
                  </div>

                  <div>
                    <Label htmlFor="paymentDate">Payment Received Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-6 border-t flex justify-end">
              <Button onClick={handleUpdatePatient} size="lg" className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Patient Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PatientDetailsPage() {
  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
      <PatientDetailsContent />
    </ProtectedRoute>
  )
}
