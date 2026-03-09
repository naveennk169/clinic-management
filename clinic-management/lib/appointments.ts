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
]

export const appointmentService = {
  // Get all appointments (for internal use)
  _getAllAppointmentsInternal: async (): Promise<Appointment[]> => {
    try {
      const res = await fetch("/api/appointments")
      const data = await res.json()
      if (data.success && data.appointments) {
        return data.appointments
      }
    } catch {}
    return []
  },

  // Get available slots for a specific date
  getAvailableSlots: async (date: string): Promise<TimeSlot[]> => {
    const appointments = await appointmentService._getAllAppointmentsInternal()
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

    // In a real app we would check availability server-side cleanly.
    // For now we assume the client check via form logic was sufficient,
    // or we'd duplicate the checking logic here but await it.
    
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      })
      const data = await res.json()
      if (data.success) {
        return data.appointment
      }
    } catch (e) {
      console.error(e)
    }

    return null
  },

  // Get patient appointments
  getPatientAppointments: async (patientId: string): Promise<Appointment[]> => {
    try {
      const allAppts = await appointmentService._getAllAppointmentsInternal()
      return allAppts
        .filter((apt: Appointment) => apt.patientId === patientId)
        .sort((a: Appointment, b: Appointment) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } catch {
      return []
    }
  },

  // Get all appointments (for admin)
  getAllAppointments: async (): Promise<Appointment[]> => {
    try {
       return await appointmentService._getAllAppointmentsInternal()
    } catch {
      return []
    }
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId: string): Promise<boolean> => {
    // Implement an update status API call in future if needed
    // For now returning false as placeholder or implement client DB hack 
    return false
  },

  // Reschedule appointment
  rescheduleAppointment: async (
    appointmentId: string,
    newDate: string,
    newTime: string,
  ): Promise<Appointment | null> => {
     return null
  },

  // Update appointment status (for admin)
  updateAppointmentStatus: async (appointmentId: string, status: Appointment["status"]): Promise<boolean> => {
     return false
  },

  // Get next appointment for patient
  getNextAppointment: async (patientId: string): Promise<Appointment | null> => {
    const appointments = await appointmentService.getPatientAppointments(patientId)
    const now = new Date()
    const upcomingAppointments = appointments.filter((apt) => {
      if(!apt.date || !apt.time) return false;
      const aptDate = new Date(`${apt.date}T${apt.time.replace(/AM|PM|\s/g, "")}`)
      return aptDate > now && apt.status === "scheduled"
    })

    return upcomingAppointments.length > 0 ? upcomingAppointments[0] : null
  },
}
