"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Heart,
  Users,
  UserPlus,
  Search,
  Eye,
  Key,
  LogOut,
  Calendar,
  CheckCircle,
  Download,
  DollarSign,
  CreditCard,
  Edit,
  Trash2,
  Menu,
  X,
  Plus,
  Activity,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"

interface AppointmentData {
  id?: string
  patientName: string
  email: string
  phone: string
  age: string
  gender: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  medicalHistory: string
  currentMedications: string
  allergies: string
  previousSurgeries: string
  smokingStatus: string
  alcoholConsumption: string
  exerciseFrequency: string
  chronicConditions: string[]
  symptoms: string
  appointmentReason: string
  preferredDate: string
  preferredTime: string
  additionalNotes: string
  submittedAt: string
  status: "pending" | "approved" | "completed"
  isApproved?: boolean // Added to track approval status
}

interface PatientCredentials {
  patientId: string
  userId: string
  name: string
  email: string
  phone: string
  password: string
  totalSessions: number
  completedSessions: number
  therapyDetails: string
  createdAt: string
  status: "active" | "inactive"
  paidAmount: number
  sessionCost: number
  paymentType: "advance" | "per-session"
  balance: number
  nextSessionDate: string
}

function AdminDashboardContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [patients, setPatients] = useState<PatientCredentials[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<PatientCredentials | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [totalSessions, setTotalSessions] = useState("")
  const [completedSessions, setCompletedSessions] = useState("")
  const [therapyDetails, setTherapyDetails] = useState("")
  const [paidAmount, setPaidAmount] = useState("")
  const [sessionCost, setSessionCost] = useState("")
  const [paymentType, setPaymentType] = useState<"advance" | "per-session">("advance")
  const [nextSessionDate, setNextSessionDate] = useState("")
  const [password, setPassword] = useState("")

  const { toast } = useToast()
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load pending appointments
      const appointmentsResponse = await fetch("/api/appointments")
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json()
        setAppointments(appointmentsData.appointments || [])
      }

      // Load all patients
      const patientsResponse = await fetch("/api/patients")
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json()
        setPatients(patientsData.patients || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Loading Error",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
  }

  const handleApproveAppointment = async () => {
    if (!selectedAppointment || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter a Password.",
        variant: "destructive",
      })
      return
    }

    try {
      const patientId = `P${Math.floor(100 + Math.random() * 900)}`

      const patientData = {
        patientId,
        userId: patientId, // Auto-generated
        name: selectedAppointment.patientName,
        email: selectedAppointment.email,
        phone: selectedAppointment.phone,
        password, // Use admin-entered password
        totalSessions: 0,
        therapyDetails: "",
        paidAmount: 0,
        sessionCost: 0,
        paymentType: "advance" as const,
        balance: 0,
        nextSessionDate: "",
      }

      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      })

      if (response.ok) {
        // Also update the appointment status in the database to 'approved'
        if (selectedAppointment.id) {
          await fetch(`/api/appointments/${selectedAppointment.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "approved" }),
          }).catch(console.error)
        }

        const updatedAppointments = appointments.map((apt) =>
          apt === selectedAppointment ? { ...apt, status: "approved" as const, isApproved: true } : apt,
        )
        setAppointments(updatedAppointments)

        toast({
          title: "Patient Account Created",
          description: `Patient ID (User ID): ${patientId} | Password: ${password}`,
          duration: 10000,
        })

        setSelectedAppointment(null)
        setPassword("")
        loadData()
      } else {
        throw new Error("Failed to create patient")
      }
    } catch (error) {
      console.error("Error approving appointment:", error)
      toast({
        title: "Approval Failed",
        description: "Unable to approve appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdatePatientDetails = async () => {
    if (!selectedPatient || !totalSessions || !therapyDetails || !sessionCost || !nextSessionDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const balance =
        paymentType === "advance"
          ? Math.max(
              0,
              Number.parseInt(totalSessions) * Number.parseFloat(sessionCost) - Number.parseFloat(paidAmount || "0"),
            )
          : Number.parseInt(totalSessions) * Number.parseFloat(sessionCost) - Number.parseFloat(paidAmount || "0")

      const updateData = {
        totalSessions: Number.parseInt(totalSessions),
        completedSessions: Number.parseInt(completedSessions || "0"),
        therapyDetails,
        paidAmount: Number.parseFloat(paidAmount || "0"),
        sessionCost: Number.parseFloat(sessionCost),
        paymentType,
        balance: Math.max(0, balance),
        nextSessionDate,
      }

      const response = await fetch(`/api/patients/${selectedPatient.patientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast({
          title: "Patient Details Updated",
          description: `Details updated for ${selectedPatient.name}`,
        })

        // Reset form and reload data
        setSelectedPatient(null)
        setTotalSessions("")
        setCompletedSessions("")
        setTherapyDetails("")
        setPaidAmount("")
        setSessionCost("")
        setPaymentType("advance")
        setNextSessionDate("")
        loadData()
      } else {
        throw new Error("Failed to update patient details")
      }
    } catch (error) {
      console.error("Error updating patient details:", error)
      toast({
        title: "Update Failed",
        description: "Unable to update patient details. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updatePatientPayment = async (patientId: string, newPaidAmount: number, newBalance: number) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/payment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paidAmount: newPaidAmount, balance: newBalance }),
      })

      if (response.ok) {
        loadData()
        toast({
          title: "Payment Updated",
          description: "Patient payment information has been updated.",
        })
      }
    } catch (error) {
      console.error("Error updating payment:", error)
      toast({
        title: "Update Failed",
        description: "Unable to update payment information.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePatient = async (patientId: string) => {
    if (confirm("Are you sure you want to delete this patient and all their records?")) {
      try {
        const response = await fetch(`/api/patients/${patientId}`, {
          method: "DELETE",
        })
        
        if (response.ok) {
          toast({
            title: "Patient Deleted",
            description: "Patient and all related records have been removed.",
          })
          loadData()
        } else {
          throw new Error("Failed to delete patient")
        }
      } catch (error) {
        console.error("Error deleting patient:", error)
        toast({
          title: "Delete Failed",
          description: "Unable to delete patient.",
          variant: "destructive",
        })
      }
    }
  }

  const handleExportData = async (type: string) => {
    try {
      const response = await fetch(`/api/export?type=${type}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `medicare-clinic-${type}-data.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast({
          title: "Export Successful",
          description: `All data has been exported successfully.`,
        })
      } else {
        throw new Error("Failed to export data")
      }
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Export Failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.status === "pending" &&
      ((apt.patientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
       (apt.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
       (apt.phone || "").includes(searchTerm)),
  )

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const pendingAppointments = appointments.filter((apt) => apt.status === "pending")
  const activePatients = patients.filter((p) => p.status === "active")
  const totalRevenue = patients.reduce((sum, p) => sum + p.paidAmount, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle>Loading Admin Dashboard...</CardTitle>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Surya's Speech and Language Clinic</h1>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">Welcome, {user?.name}</Badge>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePatients.length}</div>
              <p className="text-xs text-muted-foreground">With login access</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.reduce((sum, p) => sum + p.completedSessions, 0)}</div>
              <p className="text-xs text-muted-foreground">Sessions completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Payments received</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex gap-2">
            <Button onClick={() => handleExportData("comprehensive")} variant="default" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export All Data
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments or patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="appointments">Pending Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patient Management</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Requests</CardTitle>
                <CardDescription>
                  Review appointment submissions and approve patients with basic credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Pending Appointments</h3>
                    <p className="text-muted-foreground">All appointment requests have been processed.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient Details</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Age/Gender</TableHead>
                        <TableHead>Appointment Type</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((appointment, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{appointment.patientName}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{appointment.email}</div>
                              <div className="text-muted-foreground">{appointment.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{appointment.age} years</div>
                              <div className="text-muted-foreground capitalize">{appointment.gender}</div>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">
                            {appointment.appointmentReason?.replace("-", " ") || "General"}
                          </TableCell>
                          <TableCell>{new Date(appointment.submittedAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-1" />
                                    Review
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Appointment Request Details</DialogTitle>
                                    <DialogDescription>
                                      Complete patient information and health questionnaire
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-6">
                                    {/* Personal Information */}
                                    <div>
                                      <h4 className="font-semibold mb-3">Personal Information</h4>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium">Name</Label>
                                          <p className="text-sm">{appointment.patientName}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Age</Label>
                                          <p className="text-sm">{appointment.age} years</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Gender</Label>
                                          <p className="text-sm capitalize">{appointment.gender}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Email</Label>
                                          <p className="text-sm">{appointment.email}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Phone</Label>
                                          <p className="text-sm">{appointment.phone}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Emergency Contact</Label>
                                          <p className="text-sm">{appointment.emergencyContact || "Not provided"}</p>
                                        </div>
                                      </div>
                                      {appointment.address && (
                                        <div className="mt-4">
                                          <Label className="text-sm font-medium">Address</Label>
                                          <p className="text-sm text-muted-foreground">{appointment.address}</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Health Information */}
                                    <div>
                                      <h4 className="font-semibold mb-3">Health Information</h4>
                                      <div className="space-y-4">
                                        {appointment.medicalHistory && (
                                          <div>
                                            <Label className="text-sm font-medium">Medical History</Label>
                                            <p className="text-sm text-muted-foreground">
                                              {appointment.medicalHistory}
                                            </p>
                                          </div>
                                        )}
                                        {appointment.currentMedications && (
                                          <div>
                                            <Label className="text-sm font-medium">Current Medications</Label>
                                            <p className="text-sm text-muted-foreground">
                                              {appointment.currentMedications}
                                            </p>
                                          </div>
                                        )}
                                        {appointment.allergies && (
                                          <div>
                                            <Label className="text-sm font-medium">Allergies</Label>
                                            <p className="text-sm text-muted-foreground">{appointment.allergies}</p>
                                          </div>
                                        )}
                                        {appointment.chronicConditions.length > 0 && (
                                          <div>
                                            <Label className="text-sm font-medium">Chronic Conditions</Label>
                                            <p className="text-sm text-muted-foreground">
                                              {appointment.chronicConditions.join(", ")}
                                            </p>
                                          </div>
                                        )}
                                        {appointment.symptoms && (
                                          <div>
                                            <Label className="text-sm font-medium">Current Symptoms</Label>
                                            <p className="text-sm text-muted-foreground">{appointment.symptoms}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Lifestyle Information */}
                                    <div>
                                      <h4 className="font-semibold mb-3">Lifestyle Information</h4>
                                      <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium">Smoking Status</Label>
                                          <p className="text-sm capitalize">
                                            {appointment.smokingStatus || "Not specified"}
                                          </p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Alcohol Consumption</Label>
                                          <p className="text-sm capitalize">
                                            {appointment.alcoholConsumption || "Not specified"}
                                          </p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Exercise Frequency</Label>
                                          <p className="text-sm">{appointment.exerciseFrequency || "Not specified"}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Appointment Preferences */}
                                    <div>
                                      <h4 className="font-semibold mb-3">Appointment Preferences</h4>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-sm font-medium">Preferred Date</Label>
                                          <p className="text-sm">{appointment.preferredDate || "No preference"}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">Preferred Time</Label>
                                          <p className="text-sm capitalize">
                                            {appointment.preferredTime || "No preference"}
                                          </p>
                                        </div>
                                      </div>
                                      {appointment.additionalNotes && (
                                        <div className="mt-4">
                                          <Label className="text-sm font-medium">Additional Notes</Label>
                                          <p className="text-sm text-muted-foreground">{appointment.additionalNotes}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    onClick={() => setSelectedAppointment(appointment)}
                                    disabled={appointment.isApproved}
                                  >
                                    <Key className="h-4 w-4 mr-1" />
                                    {appointment.isApproved ? "Approved" : "Approve"}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Approve Patient & Assign Credentials</DialogTitle>
                                    <DialogDescription>Create patient account for {appointment.patientName}</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="bg-muted p-4 rounded-lg">
                                      <p className="text-sm text-balance">
                                        Patient ID / User ID will be auto-generated for logging in. Please assign a password below.
                                      </p>
                                    </div>
                                    <div>
                                      <Label htmlFor="password">Password</Label>
                                      <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                      />
                                    </div>

                                    <Button onClick={handleApproveAppointment} className="w-full">
                                      <UserPlus className="h-4 w-4 mr-2" />
                                      Create Patient Account
                                    </Button>

                                    <p className="text-xs text-muted-foreground text-center">
                                      Complete patient details in the Patient Management tab after approval.
                                    </p>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Patient Management Dashboard</CardTitle>
                <CardDescription>Comprehensive patient information and payment tracking</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Patients</h3>
                    <p className="text-muted-foreground">Approved patients will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Therapy</TableHead>
                          <TableHead>Total Sessions</TableHead>
                          <TableHead>Paid Amount</TableHead>
                          <TableHead>Sessions Completed</TableHead>
                          <TableHead>Next Session Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPatients.map((patient) => (
                          <TableRow key={patient.patientId}>
                            <TableCell className="font-medium">
                              <Link href={`/admin/patient/${patient.patientId}`} className="text-primary hover:underline">
                                {patient.patientId}
                              </Link>
                            </TableCell>
                            <TableCell>{patient.name}</TableCell>
                            <TableCell>{patient.phone}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={patient.therapyDetails}>
                              {patient.therapyDetails || "Not set"}
                            </TableCell>
                            <TableCell>{patient.totalSessions || 0}</TableCell>
                            <TableCell>₹{patient.paidAmount?.toFixed(2) || "0.00"}</TableCell>
                            <TableCell>{patient.completedSessions}</TableCell>
                            <TableCell>{patient.nextSessionDate || "Not scheduled"}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedPatient(patient)
                                        setTotalSessions(patient.totalSessions?.toString() || "")
                                        setCompletedSessions(patient.completedSessions?.toString() || "0")
                                        setTherapyDetails(patient.therapyDetails || "")
                                        setPaidAmount(patient.paidAmount?.toString() || "")
                                        setSessionCost(patient.sessionCost?.toString() || "")
                                        setPaymentType(patient.paymentType || "advance")
                                        setNextSessionDate(patient.nextSessionDate || "")
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit Details
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Update Patient Details</DialogTitle>
                                    <DialogDescription>
                                      Manage therapy details and payment information for {patient.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor="totalSessions">Total Sessions</Label>
                                        <Input
                                          id="totalSessions"
                                          type="number"
                                          value={totalSessions}
                                          onChange={(e) => setTotalSessions(e.target.value)}
                                          placeholder="e.g., 10"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="completedSessions">Sessions Completed</Label>
                                        <Input
                                          id="completedSessions"
                                          type="number"
                                          value={completedSessions}
                                          onChange={(e) => setCompletedSessions(e.target.value)}
                                          placeholder="e.g., 2"
                                        />
                                      </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor="sessionCost">Cost per Session (₹)</Label>
                                        <Input
                                          id="sessionCost"
                                          type="number"
                                          step="0.01"
                                          value={sessionCost}
                                          onChange={(e) => setSessionCost(e.target.value)}
                                          placeholder="e.g., 1500.00"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <Label htmlFor="therapyDetails">Therapy Details</Label>
                                      <Input
                                        id="therapyDetails"
                                        value={therapyDetails}
                                        onChange={(e) => setTherapyDetails(e.target.value)}
                                        placeholder="e.g., Physical therapy for lower back pain"
                                      />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor="paymentType">Payment Type</Label>
                                        <Select
                                          value={paymentType}
                                          onValueChange={(value: "advance" | "per-session") => setPaymentType(value)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="advance">Paid in Advance</SelectItem>
                                            <SelectItem value="per-session">Pay per Session</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label htmlFor="paidAmount">Amount Paid (₹)</Label>
                                        <Input
                                          id="paidAmount"
                                          type="number"
                                          step="0.01"
                                          value={paidAmount}
                                          onChange={(e) => setPaidAmount(e.target.value)}
                                          placeholder="e.g., 15000.00"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <Label htmlFor="nextSessionDate">Next Session Date</Label>
                                      <Input
                                        id="nextSessionDate"
                                        type="date"
                                        value={nextSessionDate}
                                        onChange={(e) => setNextSessionDate(e.target.value)}
                                      />
                                    </div>

                                    <Button onClick={handleUpdatePatientDetails} className="w-full">
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Update Patient Details
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeletePatient(patient.patientId)}
                                title="Delete Patient"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                           </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin" redirectTo="/admin/login">
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
