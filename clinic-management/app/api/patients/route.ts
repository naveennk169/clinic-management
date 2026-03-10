import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const patientsFromDb = await prisma.patient.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ success: true, patients: patientsFromDb })
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

    // Upsert patient: if it already exists (e.g. from public booking), upgrade it.
    const savedPatient = await prisma.patient.upsert({
      where: { email: newPatient.email },
      update: {
        patientId: patientData.patientId,
        name: newPatient.name,
        phone: newPatient.phone,
        status: "active",
      },
      create: {
        patientId: patientData.patientId,
        name: newPatient.name,
        email: newPatient.email,
        phone: newPatient.phone,
        therapyDetails: newPatient.therapyDetails,
        totalSessions: newPatient.totalSessions || 0,
        completedSessions: 0,
        status: "active",
        paidAmount: newPatient.paidAmount || 0,
        sessionCost: newPatient.sessionCost || 0,
        paymentType: newPatient.paymentType || "advance",
        balance: newPatient.balance || 0,
        nextSessionDate: newPatient.nextSessionDate || "",
      }
    })

    // Upsert User credentials for auth
    await prisma.user.upsert({
      where: { email: newPatient.email },
      update: {
        password: newPatient.password,
        patientId: patientData.patientId,
      },
      create: {
        email: newPatient.email,
        password: newPatient.password, // IMPORTANT: Should hash this eventually
        name: newPatient.name,
        role: "PATIENT",
        patientId: patientData.patientId,
      }
    })

    console.log("[v0] Patient created/updated in MongoDB via Prisma:", savedPatient.id)

    return NextResponse.json({ success: true, patient: savedPatient })
  } catch (error) {
    console.error("Error creating patient:", error)
    return NextResponse.json({ success: false, message: "Failed to create patient" }, { status: 500 })
  }
}
