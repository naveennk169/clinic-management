import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const patientId = params.id
    
    const patient = await prisma.patient.findUnique({
      where: { patientId },
      include: {
        appointments: true,
        sessions: {
          orderBy: { date: 'desc' }
        }
      }
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, patient })
  } catch (error) {
    console.error("[v0] Error fetching patient:", error)
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const patientId = params.id
    const updateData = await request.json()

    console.log("[v0] Updating patient details:", { patientId, updateData })

    const existingPatient = await prisma.patient.findUnique({
      where: { patientId }
    })

    if (!existingPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Since updateData could contain string properties that need parsing, we just spread it directly
    // Assuming matching properties map directly to Prisma schema
    const updatedPatient = await prisma.patient.update({
      where: { patientId },
      data: updateData
    })

    console.log("[v0] Patient updated successfully:", updatedPatient)

    return NextResponse.json({
      message: "Patient details updated successfully",
      patient: updatedPatient,
    })
  } catch (error) {
    console.error("[v0] Error updating patient details:", error)
    return NextResponse.json({ error: "Failed to update patient details" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const patientId = params.id
    
    const existingPatient = await prisma.patient.findUnique({
      where: { patientId }
    })

    if (!existingPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Delete related user credentials
    await prisma.user.deleteMany({
      where: { patientId }
    })

    // Delete associated appointments and sessions
    await prisma.appointment.deleteMany({
      where: { patientId }
    })
    
    await prisma.session.deleteMany({
      where: { patientId }
    })

    await prisma.patient.delete({
       where: { patientId }
    })

    return NextResponse.json({ message: "Patient deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting patient:", error)
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 })
  }
}
