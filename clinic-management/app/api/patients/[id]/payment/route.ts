import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { paidAmount, balance } = await request.json()
    const patientId = params.id

    const existingPatient = await prisma.patient.findUnique({
      where: { patientId }
    })

    if (!existingPatient) {
      return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 })
    }

    // Update payment information
    const updatedPatient = await prisma.patient.update({
      where: { patientId },
      data: {
        paidAmount,
        balance
      }
    })

    return NextResponse.json({ success: true, patient: updatedPatient })
  } catch (error) {
    console.error("Error updating patient payment:", error)
    return NextResponse.json({ success: false, message: "Failed to update payment" }, { status: 500 })
  }
}
