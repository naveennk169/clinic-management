"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Plus, Search, Calendar, FileText, User, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Session {
  id: number
  patientId: string
  sessionNumber: number
  date: string
  type: string
  notes: string
  workoutPlan: string
  completedAt: string
  status: string
}

interface Patient {
  patientId: string
  name: string
  email: string
  phone: string
  totalSessions: number
  completedSessions: number
  therapyDetails: string
  status: string
}

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // New session form state
  const [newSession, setNewSession] = useState({
    patientId: "",
    sessionNumber: 1,
    date: new Date().toISOString().split("T")[0],
    type: "physical-therapy",
    notes: "",
    workoutPlan: "",
  })

  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load sessions
      const sessionsResponse = await fetch("/api/sessions")
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setSessions(sessionsData.sessions || [])
      }

      // Load patients
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

  const handleCreateSession = async () => {
    if (!newSession.patientId || !newSession.notes) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSession),
      })

      if (response.ok) {
        toast({
          title: "Session Recorded",
          description: `Session recorded for patient ${newSession.patientId}`,
        })

        // Reset form and reload data
        setNewSession({
          patientId: "",
          sessionNumber: 1,
          date: new Date().toISOString().split("T")[0],
          type: "physical-therapy",
          notes: "",
          workoutPlan: "",
        })
        setIsDialogOpen(false)
        loadData()
      } else {
        throw new Error("Failed to create session")
      }
    } catch (error) {
      console.error("Error creating session:", error)
      toast({
        title: "Session Creation Failed",
        description: "Unable to record session. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredSessions = sessions.filter((session) => {
    const patient = patients.find((p) => p.patientId === session.patientId)
    const patientName = patient?.name || ""

    return (
      session.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.notes.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.patientId === patientId)
    return patient?.name || "Unknown Patient"
  }

  const getNextSessionNumber = (patientId: string) => {
    const patientSessions = sessions.filter((s) => s.patientId === patientId)
    return patientSessions.length + 1
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
            <CardTitle>Loading Sessions...</CardTitle>
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
            <div className="flex items-center gap-4">
              <Link href="/admin" passHref>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                  <Heart className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Session Management</h1>
                  <p className="text-xs text-muted-foreground">Track and record patient sessions</p>
                </div>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record New Session</DialogTitle>
                  <DialogDescription>Add a completed therapy session for a patient</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="patientSelect">Patient</Label>
                    <Select
                      value={newSession.patientId}
                      onValueChange={(value) => {
                        setNewSession((prev) => ({
                          ...prev,
                          patientId: value,
                          sessionNumber: getNextSessionNumber(value),
                        }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.patientId} value={patient.patientId}>
                            {patient.patientId} - {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sessionNumber">Session Number</Label>
                      <Input
                        id="sessionNumber"
                        type="number"
                        value={newSession.sessionNumber}
                        onChange={(e) =>
                          setNewSession((prev) => ({ ...prev, sessionNumber: Number.parseInt(e.target.value) }))
                        }
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newSession.date}
                        onChange={(e) => setNewSession((prev) => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="type">Session Type</Label>
                    <Select
                      value={newSession.type}
                      onValueChange={(value) => setNewSession((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physical-therapy">Physical Therapy</SelectItem>
                        <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="assessment">Assessment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Session Notes</Label>
                    <Textarea
                      id="notes"
                      value={newSession.notes}
                      onChange={(e) => setNewSession((prev) => ({ ...prev, notes: e.target.value }))}
                      placeholder="Describe what was accomplished in this session..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="workoutPlan">Home Workout Plan</Label>
                    <Textarea
                      id="workoutPlan"
                      value={newSession.workoutPlan}
                      onChange={(e) => setNewSession((prev) => ({ ...prev, workoutPlan: e.target.value }))}
                      placeholder="Describe the home exercises for the patient..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleCreateSession} className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Record Session
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
              <p className="text-xs text-muted-foreground">All recorded sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.filter((p) => p.status === "active").length}</div>
              <p className="text-xs text-muted-foreground">Patients with sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  sessions.filter((s) => {
                    const sessionDate = new Date(s.date)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return sessionDate >= weekAgo
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Sessions this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per Patient</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.length > 0 ? Math.round((sessions.length / patients.length) * 10) / 10 : 0}
              </div>
              <p className="text-xs text-muted-foreground">Sessions per patient</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions by patient or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Session Records</CardTitle>
            <CardDescription>All recorded therapy sessions and patient progress</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sessions Found</h3>
                <p className="text-muted-foreground">Start recording patient sessions to see them here.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Session #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{getPatientName(session.patientId)}</div>
                          <div className="text-muted-foreground">{session.patientId}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">#{session.sessionNumber}</TableCell>
                      <TableCell>{new Date(session.date).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{session.type.replace("-", " ")}</TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs truncate" title={session.notes}>
                          {session.notes}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{session.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
