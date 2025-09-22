import { type NextRequest, NextResponse } from "next/server"
import { patients } from "@/lib/mock-data"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { paidAmount, balance } = await request.json()
    const patientId = params.id

    const patientIndex = patients.findIndex((p) => p.patientId === patientId)

    if (patientIndex === -1) {
      return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 })
    }

    // Update payment information
    patients[patientIndex].paidAmount = paidAmount
    patients[patientIndex].balance = balance

    return NextResponse.json({ success: true, patient: patients[patientIndex] })
  } catch (error) {
    console.error("Error updating patient payment:", error)
    return NextResponse.json({ success: false, message: "Failed to update payment" }, { status: 500 })
  }
}
