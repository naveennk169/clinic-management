import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { type } = data

    if (type === "patient") {
      const { patientId, password } = data
      
      const user = await prisma.user.findFirst({
        where: {
          patientId,
          password,
          role: "PATIENT"
        }
      })

      if (user) {
        return NextResponse.json({ success: true, user })
      }
    } else if (type === "admin") {
      const { username, password } = data
      
      // Usually, there is an admin seeded in DB, or checked against env
      if (username === "admin" && password === "admin123") {
         return NextResponse.json({ success: true, user: {
           id: "admin1",
           name: "Dr. Admin",
           email: "admin@clinic.com",
           role: "admin",
         }})
      }
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 })
  }
}
