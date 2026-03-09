import { type NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    if (patientId) {
      const patientSessions = await prisma.session.findMany({
        where: { patientId },
        orderBy: { date: "desc" }
      })
      return NextResponse.json({ success: true, sessions: patientSessions })
    }

    const allSessions = await prisma.session.findMany({
      orderBy: { date: "desc" }
    })
    return NextResponse.json({ success: true, sessions: allSessions })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json()

    // Verify patient exists
    const patientRecord = await prisma.patient.findUnique({
      where: { patientId: sessionData.patientId }
    })

    if (!patientRecord) {
      return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 })
    }

    const newSession = await prisma.session.create({
      data: {
        patientId: sessionData.patientId,
        sessionNumber: sessionData.sessionNumber || (patientRecord.completedSessions + 1),
        date: sessionData.date || new Date().toISOString(),
        type: sessionData.type,
        notes: sessionData.notes,
        workoutPlan: sessionData.workoutPlan,
        status: "completed",
      }
    })

    // Update patient's completed sessions count
    await prisma.patient.update({
      where: { patientId: sessionData.patientId },
      data: {
        completedSessions: {
          increment: 1
        }
      }
    })

    console.log(`Session recorded for patient ${sessionData.patientId} in MongoDB`)

    return NextResponse.json({ success: true, session: newSession })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ success: false, message: "Failed to create session" }, { status: 500 })
  }
}
