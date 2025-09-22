import { type NextRequest, NextResponse } from "next/server"
import { appointments } from "@/lib/mock-data"

export async function GET() {
  try {
    return NextResponse.json({ success: true, appointments })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch appointments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const appointmentData = await request.json()

    const newAppointment = {
      ...appointmentData,
      submittedAt: new Date().toISOString(),
      status: "pending",
    }

    // In production, this would save to Google Sheets
    appointments.push(newAppointment)

    return NextResponse.json({ success: true, appointment: newAppointment })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ success: false, message: "Failed to create appointment" }, { status: 500 })
  }
}
