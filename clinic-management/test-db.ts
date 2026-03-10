import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test() {
  try {
    const patients = await prisma.patient.findMany()
    const apps = await prisma.appointment.findMany()
    console.log("Patients:", patients.length, "Apps:", apps.length)
  } catch (err) {
    console.error(err)
  } finally {
    await prisma.$disconnect()
  }
}

test()
