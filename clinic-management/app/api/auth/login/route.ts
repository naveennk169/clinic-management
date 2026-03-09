import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { patientId, password } = await request.json()
    console.log("[v0] Login attempt - User ID:", patientId)

    if (!patientId || !password) {
      return NextResponse.json({ success: false, message: "User ID and password are required" }, { status: 400 })
    }

    const patient = await prisma.user.findFirst({
        where: {
          patientId,
          password,
          role: "PATIENT"
        }
    })

    console.log("[v0] Patient found:", !!patient)

    if (patient) {
      console.log("[v0] Login successful for patient:", patient.name)
      // Remove password from response
      const { password: _, ...patientData } = patient as any
      return NextResponse.json({ success: true, patient: patientData })
    } else {
      console.log("[v0] Login failed - no matching patient found")
      return NextResponse.json({ success: false, message: "Invalid user ID or password" }, { status: 401 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
