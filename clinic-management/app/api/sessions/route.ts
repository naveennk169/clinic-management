import { type NextRequest, NextResponse } from "next/server"

// Mock database for sessions
const sessions: any[] = [
  {
    id: 1,
    patientId: "P001",
    sessionNumber: 1,
    date: "2024-01-20",
    type: "physical-therapy",
    notes: "Initial assessment completed. Patient showed good range of motion.",
    workoutPlan: "Basic stretching exercises, 15 minutes daily",
    completedAt: "2024-01-20T10:30:00Z",
    status: "completed",
  },
  {
    id: 2,
    patientId: "P001",
    sessionNumber: 2,
    date: "2024-01-25",
    type: "physical-therapy",
    notes: "Improvement in flexibility. Added core strengthening exercises.",
    workoutPlan: "Core strengthening routine, 20 minutes daily",
    completedAt: "2024-01-25T11:00:00Z",
    status: "completed",
  },
  {
    id: 3,
    patientId: "P002",
    sessionNumber: 1,
    date: "2024-01-22",
    type: "rehabilitation",
    notes: "Knee mobility assessment. Started gentle range of motion exercises.",
    workoutPlan: "Gentle knee exercises, 10 minutes twice daily",
    completedAt: "2024-01-22T14:30:00Z",
    status: "completed",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    if (patientId) {
      const patientSessions = sessions.filter((session) => session.patientId === patientId)
      return NextResponse.json({ success: true, sessions: patientSessions })
    }

    return NextResponse.json({ success: true, sessions })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionData = await request.json()

    const newSession = {
      id: sessions.length + 1,
      ...sessionData,
      completedAt: new Date().toISOString(),
      status: "completed",
    }

    // In production, this would save to Google Sheets
    sessions.push(newSession)

    // Update patient's completed sessions count
    // This would also be done in Google Sheets in production
    console.log(`Session recorded for patient ${sessionData.patientId}`)

    return NextResponse.json({ success: true, session: newSession })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ success: false, message: "Failed to create session" }, { status: 500 })
  }
}
