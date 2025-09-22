"use client"

// Payment types and utilities
export interface PaymentPlan {
  id: string
  name: string
  type: "per-session" | "upfront"
  sessionsIncluded: number
  totalAmount: number
  pricePerSession: number
  description: string
}

export interface PaymentRecord {
  id: string
  patientId: string
  planId: string
  amount: number
  paymentDate: string
  paymentMethod: string
  status: "completed" | "pending" | "failed"
  sessionsPaid: number
  remainingSessions: number
  remainingBalance: number
}

export interface SessionDeduction {
  id: string
  patientId: string
  sessionDate: string
  amountDeducted: number
  remainingBalance: number
  sessionNumber: number
}

// Available payment plans
export const paymentPlans: PaymentPlan[] = [
  {
    id: "per-session",
    name: "Pay Per Session",
    type: "per-session",
    sessionsIncluded: 1,
    totalAmount: 500,
    pricePerSession: 500,
    description: "Pay ₹500 for each therapy session individually",
  },
  {
    id: "upfront-10",
    name: "10-Day Treatment Package",
    type: "upfront",
    sessionsIncluded: 10,
    totalAmount: 5000,
    pricePerSession: 500,
    description: "Pay ₹5000 upfront for 10 sessions (₹500 deducted per session)",
  },
]

// Mock payment service
export const paymentService = {
  // Process payment
  processPayment: async (patientId: string, planId: string, paymentMethod: string): Promise<PaymentRecord | null> => {
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate payment processing

    const plan = paymentPlans.find((p) => p.id === planId)
    if (!plan) return null

    // Simulate payment success (90% success rate)
    const isSuccess = Math.random() > 0.1

    if (isSuccess) {
      const paymentRecord: PaymentRecord = {
        id: `payment_${Date.now()}`,
        patientId,
        planId,
        amount: plan.totalAmount,
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod,
        status: "completed",
        sessionsPaid: plan.sessionsIncluded,
        remainingSessions: plan.sessionsIncluded,
        remainingBalance: plan.totalAmount,
      }

      // Store payment record (in production, save to database)
      const existingPayments = JSON.parse(localStorage.getItem("payment_records") || "[]")
      existingPayments.push(paymentRecord)
      localStorage.setItem("payment_records", JSON.stringify(existingPayments))

      return paymentRecord
    }

    return null
  },

  // Get patient payment records
  getPatientPayments: (patientId: string): PaymentRecord[] => {
    if (typeof window === "undefined") return []

    try {
      const payments = JSON.parse(localStorage.getItem("payment_records") || "[]")
      return payments.filter((p: PaymentRecord) => p.patientId === patientId)
    } catch {
      return []
    }
  },

  // Deduct session amount
  deductSession: async (patientId: string, sessionDate: string): Promise<SessionDeduction | null> => {
    const payments = paymentService.getPatientPayments(patientId)
    const activePayment = payments.find((p) => p.remainingSessions > 0 && p.status === "completed")

    if (!activePayment) return null

    const deduction: SessionDeduction = {
      id: `deduction_${Date.now()}`,
      patientId,
      sessionDate,
      amountDeducted: 500,
      remainingBalance: activePayment.remainingBalance - 500,
      sessionNumber: activePayment.sessionsPaid - activePayment.remainingSessions + 1,
    }

    // Update payment record
    activePayment.remainingSessions -= 1
    activePayment.remainingBalance -= 500

    // Save updated payments
    const allPayments = JSON.parse(localStorage.getItem("payment_records") || "[]")
    const updatedPayments = allPayments.map((p: PaymentRecord) => (p.id === activePayment.id ? activePayment : p))
    localStorage.setItem("payment_records", JSON.stringify(updatedPayments))

    // Store deduction record
    const existingDeductions = JSON.parse(localStorage.getItem("session_deductions") || "[]")
    existingDeductions.push(deduction)
    localStorage.setItem("session_deductions", JSON.stringify(existingDeductions))

    return deduction
  },

  // Get patient session deductions
  getPatientDeductions: (patientId: string): SessionDeduction[] => {
    if (typeof window === "undefined") return []

    try {
      const deductions = JSON.parse(localStorage.getItem("session_deductions") || "[]")
      return deductions.filter((d: SessionDeduction) => d.patientId === patientId)
    } catch {
      return []
    }
  },

  // Get current balance for patient
  getCurrentBalance: (patientId: string): { balance: number; remainingSessions: number } => {
    const payments = paymentService.getPatientPayments(patientId)
    const activePayment = payments.find((p) => p.remainingSessions > 0 && p.status === "completed")

    if (activePayment) {
      return {
        balance: activePayment.remainingBalance,
        remainingSessions: activePayment.remainingSessions,
      }
    }

    return { balance: 0, remainingSessions: 0 }
  },
}
