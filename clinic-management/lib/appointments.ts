"use client"

// Appointment types and utilities
export interface TimeSlot {
  id: string
  time: string
  available: boolean
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  date: string
  time: string
  type: "consultation" | "therapy" | "follow-up"
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  notes?: string
  createdAt: string
}

export interface AvailableSlot {
  date: string
  slots: TimeSlot[]
}

// Available time slots for appointments
const timeSlots: TimeSlot[] = [
  { id: "09:00", time: "09:00 AM", available: true },
  { id: "09:30", time: "09:30 AM", available: true },
  { id: "10:00", time: "10:00 AM", available: true },
  { id: "10:30", time: "10:30 AM", available: true },
  { id: "11:00", time: "11:00 AM", available: true },
  { id: "11:30", time: "11:30 AM", available: true },
  { id: "14:00", time: "02:00 PM", available: true },
  { id: "14:30", time: "02:30 PM", available: true },
  { id: "15:00", time: "03:00 PM", available: true },
  { id: "15:30", time: "03:30 PM", available: true },
  { id: "16:00", time: "04:00 PM", available: true },
  { id: "16:30", time: "04:30 PM", available: true },
  { id: "17:00", time: "05:00 PM", available: true },
]

// Mock appointment service
export const appointmentService = {
  // Get available slots for a specific date
  getAvailableSlots: (date: string): TimeSlot[] => {
    const appointments = appointmentService.getAllAppointments()
    const bookedSlots = appointments
      .filter((apt) => apt.date === date && apt.status === "scheduled")
      .map((apt) => apt.time)

    return timeSlots.map((slot) => ({
      ...slot,
      available: !bookedSlots.includes(slot.time),
    }))
  },

  // Get available dates (next 30 days, excluding Sundays)
  getAvailableDates: (): string[] => {
    const dates: string[] = []
    const today = new Date()

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Skip Sundays (0 = Sunday)
      if (date.getDay() !== 0) {
        dates.push(date.toISOString().split("T")[0])
      }
    }

    return dates
  },

  // Book an appointment
  bookAppointment: async (appointmentData: {
    patientId: string
    patientName: string
    date: string
    time: string
    type: "consultation" | "therapy" | "follow-up"
    notes?: string
  }): Promise<Appointment | null> => {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

    // Check if slot is still available
    const availableSlots = appointmentService.getAvailableSlots(appointmentData.date)
    const selectedSlot = availableSlots.find((slot) => slot.time === appointmentData.time)

    if (!selectedSlot || !selectedSlot.available) {
      return null // Slot no longer available
    }

    const appointment: Appointment = {
      id: `apt_${Date.now()}`,
      ...appointmentData,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    }

    // Store appointment
    const existingAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
    existingAppointments.push(appointment)
    localStorage.setItem("appointments", JSON.stringify(existingAppointments))

    return appointment
  },

  // Get patient appointments
  getPatientAppointments: (patientId: string): Appointment[] => {
    if (typeof window === "undefined") return []

    try {
      const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")
      return appointments
        .filter((apt: Appointment) => apt.patientId === patientId)
        .sort((a: Appointment, b: Appointment) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } catch {
      return []
    }
  },

  // Get all appointments (for admin)
  getAllAppointments: (): Appointment[] => {
    if (typeof window === "undefined") return []

    try {
      const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")
      return appointments.sort(
        (a: Appointment, b: Appointment) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )
    } catch {
      return []
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")
      const updatedAppointments = appointments.map((apt: Appointment) =>
        apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt,
      )
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments))
      return true
    } catch {
      return false
    }
  },

  // Reschedule appointment
  rescheduleAppointment: async (
    appointmentId: string,
    newDate: string,
    newTime: string,
  ): Promise<Appointment | null> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if new slot is available
    const availableSlots = appointmentService.getAvailableSlots(newDate)
    const selectedSlot = availableSlots.find((slot) => slot.time === newTime)

    if (!selectedSlot || !selectedSlot.available) {
      return null
    }

    try {
      const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")
      const updatedAppointments = appointments.map((apt: Appointment) =>
        apt.id === appointmentId ? { ...apt, date: newDate, time: newTime } : apt,
      )
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments))

      const updatedAppointment = updatedAppointments.find((apt: Appointment) => apt.id === appointmentId)
      return updatedAppointment || null
    } catch {
      return null
    }
  },

  // Update appointment status (for admin)
  updateAppointmentStatus: async (appointmentId: string, status: Appointment["status"]): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const appointments = JSON.parse(localStorage.getItem("appointments") || "[]")
      const updatedAppointments = appointments.map((apt: Appointment) =>
        apt.id === appointmentId ? { ...apt, status } : apt,
      )
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments))
      return true
    } catch {
      return false
    }
  },

  // Get next appointment for patient
  getNextAppointment: (patientId: string): Appointment | null => {
    const appointments = appointmentService.getPatientAppointments(patientId)
    const now = new Date()
    const upcomingAppointments = appointments.filter((apt) => {
      const aptDate = new Date(`${apt.date}T${apt.time.replace(/AM|PM/, "")}`)
      return aptDate > now && apt.status === "scheduled"
    })

    return upcomingAppointments.length > 0 ? upcomingAppointments[0] : null
  },
}
