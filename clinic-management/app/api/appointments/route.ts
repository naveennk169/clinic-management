import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export async function GET() {
  try {
    const appointmentsFromDb = await prisma.appointment.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ success: true, appointments: appointmentsFromDb })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch appointments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json()

    // First find the patient to link to
    const patientRecord = await prisma.patient.findUnique({
      where: { patientId: appointmentData.patientId }
    })

    const newAppointment = await prisma.appointment.create({
      data: {
        patientId: appointmentData.patientId,
        patientName: appointmentData.patientName,
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
        preferredDate: appointmentData.preferredDate,
        preferredTime: appointmentData.preferredTime,
        additionalNotes: appointmentData.additionalNotes,
        type: appointmentData.type || "consultation",
        status: "pending",
      }
    })

    return NextResponse.json({ success: true, appointment: newAppointment })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ success: false, message: "Failed to create appointment" }, { status: 500 })
  }
}
