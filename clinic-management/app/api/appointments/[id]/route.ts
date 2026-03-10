import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const appointmentId = params.id
    const updateData = await request.json()

    console.log(`[v0] Updating appointment ${appointmentId}:`, updateData)

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: "Appointment updated successfully",
      appointment: updatedAppointment,
    })
  } catch (error) {
    console.error("[v0] Error updating appointment details:", error)
    return NextResponse.json({ success: false, message: "Failed to update appointment details" }, { status: 500 })
  }
}
