import { type NextRequest, NextResponse } from "next/server"
import { patients } from "@/lib/mock-data"

export async function POST(request: NextRequest) {
  try {
    const { patientId, password } = await request.json()
    console.log("[v0] Login attempt - User ID:", patientId, "Password:", password)
    console.log(
      "[v0] Available patients for login:",
      patients.map((p) => ({ userId: p.userId, patientId: p.patientId, name: p.name, hasPassword: !!p.password })),
    )

    if (!patientId || !password) {
      return NextResponse.json({ success: false, message: "User ID and password are required" }, { status: 400 })
    }

    const patient = patients.find((p) => p.userId === patientId && p.password === password)
    console.log("[v0] Patient found:", !!patient)

    if (patient) {
      console.log("[v0] Login successful for patient:", patient.name)
      // Remove password from response
      const { password: _, ...patientData } = patient
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
