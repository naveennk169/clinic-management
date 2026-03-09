"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Heart, CalendarIcon, ArrowLeft, Clock, Plus, X, Edit } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ProtectedRoute } from "@/components/protected-route"
import { appointmentService, type Appointment } from "@/lib/appointments"
import { paymentService } from "@/lib/payment"

function AppointmentsPageContent() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [appointmentType, setAppointmentType] = useState<"consultation" | "therapy" | "follow-up">("therapy")
  const [notes, setNotes] = useState("")
  const [isBooking, setIsBooking] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [currentBalance, setCurrentBalance] = useState({ balance: 0, remainingSessions: 0 })
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.patientId) {
      loadAppointments()
      const balance = paymentService.getCurrentBalance(user.patientId)
      setCurrentBalance(balance)
    }
  }, [user])

  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0]
      appointmentService.getAvailableSlots(dateStr).then(slots => {
        setAvailableSlots(slots)
      })
    }
  }, [selectedDate])

  const loadAppointments = async () => {
    if (user?.patientId) {
      const userAppointments = await appointmentService.getPatientAppointments(user.patientId)
      setAppointments(userAppointments)
    }
  }

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !user?.patientId) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your appointment",
        variant: "destructive",
      })
      return
    }

    if (currentBalance.remainingSessions <= 0) {
      toast({
        title: "No Sessions Available",
        description: "Please make a payment to book appointments",
        variant: "destructive",
      })
      return
    }

    setIsBooking(true)

    try {
      const appointment = await appointmentService.bookAppointment({
        patientId: user.patientId,
        patientName: user.name,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
        type: appointmentType,
        notes: notes || undefined,
      })

      if (appointment) {
        toast({
          title: "Appointment Booked!",
          description: `Your ${appointmentType} is scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTime}`,
        })

        loadAppointments()
        setShowBookingDialog(false)
        setSelectedTime("")
        setNotes("")
      } else {
        toast({
          title: "Booking Failed",
          description: "The selected time slot is no longer available",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Booking Error",
        description: "An error occurred while booking your appointment",
        variant: "destructive",
      })
    } finally {
      setIsBooking(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    const success = await appointmentService.cancelAppointment(appointmentId)

    if (success) {
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully",
      })
      loadAppointments()
    } else {
      toast({
        title: "Cancellation Failed",
        description: "Unable to cancel appointment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleAppointment || !selectedDate || !selectedTime) return

    setIsBooking(true)

    try {
      const updated = await appointmentService.rescheduleAppointment(
        rescheduleAppointment.id,
        selectedDate.toISOString().split("T")[0],
        selectedTime,
      )

      if (updated) {
        toast({
          title: "Appointment Rescheduled",
          description: `Your appointment has been moved to ${selectedDate.toLocaleDateString()} at ${selectedTime}`,
        })
        loadAppointments()
        setRescheduleAppointment(null)
        setSelectedTime("")
      } else {
        toast({
          title: "Reschedule Failed",
          description: "The selected time slot is not available",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Reschedule Error",
        description: "An error occurred while rescheduling",
        variant: "destructive",
      })
    } finally {
      setIsBooking(false)
    }
  }

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "scheduled":
        return "default"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      case "no-show":
        return "outline"
      default:
        return "secondary"
    }
  }

  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = new Date(`${apt.date}T${apt.time.replace(/AM|PM/, "")}`)
    return aptDate > new Date() && apt.status === "scheduled"
  })

  const pastAppointments = appointments.filter((apt) => {
    const aptDate = new Date(`${apt.date}T${apt.time.replace(/AM|PM/, "")}`)
    return aptDate <= new Date() || apt.status !== "scheduled"
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/patient/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-semibold">HealthCare Clinic - Appointments</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
            <p className="text-muted-foreground">Schedule and manage your therapy sessions</p>
          </div>
          <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
            <DialogTrigger asChild>
              <Button disabled={currentBalance.remainingSessions <= 0}>
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Book New Appointment</DialogTitle>
                <DialogDescription>Select a date and time for your therapy session</DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium mb-4 block">Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today || date.getDay() === 0 // Disable past dates and Sundays
                    }}
                    className="rounded-md border"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="appointmentType">Appointment Type</Label>
                    <Select value={appointmentType} onValueChange={(value: any) => setAppointmentType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="therapy">Therapy Session</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedDate && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Available Times for {selectedDate.toLocaleDateString()}
                      </Label>
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot.id}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            size="sm"
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className="justify-start"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific concerns or requests..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleBookAppointment} className="w-full" disabled={isBooking || !selectedTime}>
                    {isBooking ? "Booking..." : "Book Appointment"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {currentBalance.remainingSessions <= 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
            <CardContent className="pt-6">
              <p className="text-yellow-700 dark:text-yellow-300">
                <strong>No sessions available.</strong> Please{" "}
                <Link href="/patient/payment" className="underline">
                  make a payment
                </Link>{" "}
                to book appointments.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Your scheduled sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold capitalize">{appointment.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      </div>
                      {appointment.notes && <p className="text-sm text-muted-foreground mb-3">{appointment.notes}</p>}
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setRescheduleAppointment(appointment)}>
                              <Edit className="h-3 w-3 mr-1" />
                              Reschedule
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Reschedule Appointment</DialogTitle>
                              <DialogDescription>Select a new date and time for your appointment</DialogDescription>
                            </DialogHeader>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <Label className="text-base font-medium mb-4 block">Select New Date</Label>
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={setSelectedDate}
                                  disabled={(date) => {
                                    const today = new Date()
                                    today.setHours(0, 0, 0, 0)
                                    return date < today || date.getDay() === 0
                                  }}
                                  className="rounded-md border"
                                />
                              </div>

                              <div className="space-y-4">
                                {selectedDate && (
                                  <div>
                                    <Label className="text-sm font-medium mb-2 block">
                                      Available Times for {selectedDate.toLocaleDateString()}
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                      {availableSlots.map((slot) => (
                                        <Button
                                          key={slot.id}
                                          variant={selectedTime === slot.time ? "default" : "outline"}
                                          size="sm"
                                          disabled={!slot.available}
                                          onClick={() => setSelectedTime(slot.time)}
                                          className="justify-start"
                                        >
                                          <Clock className="h-3 w-3 mr-1" />
                                          {slot.time}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <Button
                                  onClick={handleReschedule}
                                  className="w-full"
                                  disabled={isBooking || !selectedTime}
                                >
                                  {isBooking ? "Rescheduling..." : "Reschedule Appointment"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" size="sm" onClick={() => handleCancelAppointment(appointment.id)}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No upcoming appointments</p>
              )}
            </CardContent>
          </Card>

          {/* Past Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
              <CardDescription>Your previous sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {pastAppointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastAppointments.slice(0, 10).map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell className="capitalize">{appointment.type}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No appointment history</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AppointmentsPage() {
  return (
    <ProtectedRoute requiredRole="patient" redirectTo="/login">
      <AppointmentsPageContent />
    </ProtectedRoute>
  )
}
