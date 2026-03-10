import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export async function GET() {
  try {
    const appointmentsFromDb = await prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
    })
    const mapped = appointmentsFromDb.map(apt => ({
      ...apt,
      date: apt.preferredDate || "",
      time: apt.preferredTime || "",
    }))
    return NextResponse.json({ success: true, appointments: mapped })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch appointments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json()

    let patientId = appointmentData.patientId
    let dbPatient = null

    if (patientId) {
      dbPatient = await prisma.patient.findUnique({
        where: { patientId }
      })
    } else if (appointmentData.email) {
      // It's a public booking, try to find patient by email
      dbPatient = await prisma.patient.findUnique({
        where: { email: appointmentData.email }
      })
      if (!dbPatient) {
        patientId = `P${Math.floor(100 + Math.random() * 900)}`
        dbPatient = await prisma.patient.create({
          data: {
             patientId,
             name: appointmentData.patientName || appointmentData.name || "Unknown",
             email: appointmentData.email,
             phone: appointmentData.phone,
          }
        })
      } else {
        patientId = dbPatient.patientId
      }
    } else {
        patientId = `P${Math.floor(100 + Math.random() * 900)}`
        dbPatient = await prisma.patient.create({
          data: {
             patientId,
             name: appointmentData.patientName || appointmentData.name || "Unknown",
             email: `guest-${patientId}@example.com`,
             phone: appointmentData.phone,
          }
        })
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        patientId: patientId,
        patientName: dbPatient?.name || appointmentData.patientName || appointmentData.name || "Unknown",
        email: appointmentData.email,
        phone: appointmentData.phone,
        age: appointmentData.age,
        gender: appointmentData.gender,
        address: appointmentData.address,
        emergencyContact: appointmentData.emergencyContact,
        emergencyPhone: appointmentData.emergencyPhone,
        medicalHistory: appointmentData.medicalHistory,
        currentMedications: appointmentData.currentMedications,
        allergies: appointmentData.allergies,
        previousSurgeries: appointmentData.previousSurgeries,
        smokingStatus: appointmentData.smokingStatus,
        alcoholConsumption: appointmentData.alcoholConsumption,
        exerciseFrequency: appointmentData.exerciseFrequency,
        chronicConditions: appointmentData.chronicConditions || [],
        symptoms: appointmentData.symptoms,
        appointmentReason: appointmentData.appointmentReason,
        preferredDate: appointmentData.date || appointmentData.preferredDate,
        preferredTime: appointmentData.time || appointmentData.preferredTime,
        additionalNotes: appointmentData.additionalNotes || appointmentData.notes,
        type: appointmentData.type || "consultation",
        status: "pending",
      }
    })

    const mappedAppointment = {
      ...newAppointment,
      date: newAppointment.preferredDate || "",
      time: newAppointment.preferredTime || ""
    }

    return NextResponse.json({ success: true, appointment: mappedAppointment })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ success: false, message: "Failed to create appointment" }, { status: 500 })
  }
}

