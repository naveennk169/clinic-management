import { type NextRequest, NextResponse } from "next/server"
import { patients } from "@/lib/mock-data"
import { googleSheetsService } from "@/lib/google-sheets" // added import

export async function GET() {
  try {
    console.log("[v0] GET /api/patients - Current patients count:", patients.length)
    // Return patients without passwords
    const patientsWithoutPasswords = patients.map(({ password, ...patient }) => patient)
    return NextResponse.json({ success: true, patients: patientsWithoutPasswords })
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch patients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const patientData = await request.json()
    console.log("[v0] POST /api/patients - Received patient data:", patientData)

    const newPatient = {
      ...patientData,
      completedSessions: 0,
      createdAt: new Date().toISOString(),
      status: "active",
      paidAmount: patientData.paidAmount || 0,
      sessionCost: patientData.sessionCost || 0,
      paymentType: patientData.paymentType || "advance",
      balance: patientData.balance || 0,
      nextSessionDate: patientData.nextSessionDate || "",
    }

    console.log("[v0] Creating new patient:", newPatient)

    // In production, this would save to Google Sheets
    patients.push(newPatient)

    // Build a shape that matches the Google Sheets patient row
    const sheetPatient = {
      patientId: newPatient.patientId,
      name: newPatient.name,
      email: newPatient.email,
      phone: newPatient.phone || "",
      password: newPatient.password || "",
      totalSessions: newPatient.totalSessions || 0,
      completedSessions: newPatient.completedSessions || 0,
      therapyDetails: newPatient.therapyDetails || "",
      createdAt: newPatient.createdAt,
      status: newPatient.status,
    }

    let sheetStored = false
    try {
      sheetStored = await googleSheetsService.storePatientCredentials(sheetPatient)
      if (!sheetStored) {
        console.error("[v0] Google Sheets: storePatientCredentials returned false")
      } else {
        console.log("[v0] Patient stored in Google Sheets")
      }
    } catch (e) {
      console.error("[v0] Error storing patient to Google Sheets:", e)
    }

    // Return patient without password
    const { password, ...patientResponse } = newPatient
    return NextResponse.json({ success: true, patient: patientResponse, sheetStored })
  } catch (error) {
    console.error("Error creating patient:", error)
    return NextResponse.json({ success: false, message: "Failed to create patient" }, { status: 500 })
  }
}
