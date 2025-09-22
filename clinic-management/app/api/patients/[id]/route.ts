import { type NextRequest, NextResponse } from "next/server"
import { patients } from "@/lib/mock-data"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const patientId = params.id
    const updateData = await request.json()

    console.log("[v0] Updating patient details:", { patientId, updateData })

    const patientIndex = patients.findIndex((p) => p.patientId === patientId)

    if (patientIndex === -1) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Update patient with new details
    patients[patientIndex] = {
      ...patients[patientIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    console.log("[v0] Patient updated successfully:", patients[patientIndex])

    return NextResponse.json({
      message: "Patient details updated successfully",
      patient: patients[patientIndex],
    })
  } catch (error) {
    console.error("[v0] Error updating patient details:", error)
    return NextResponse.json({ error: "Failed to update patient details" }, { status: 500 })
  }
}
