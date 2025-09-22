// Excel export utility functions for clinic data
export interface PatientData {
  patientId: string
  name: string
  email: string
  phone: string
  age: number
  registrationDate: string
  totalSessions: number
  completedSessions: number
  remainingBalance: number
  paymentType: string
  lastVisit: string
  medicalHistory?: string
}

export interface AppointmentData {
  appointmentId: string
  patientId: string
  patientName: string
  date: string
  time: string
  type: string
  status: string
  createdAt: string
}

export interface PaymentData {
  paymentId: string
  patientId: string
  patientName: string
  amount: number
  paymentType: string
  method: string
  status: string
  date: string
}

export interface RegistrationData {
  id: number
  name: string
  email: string
  phone: string
  age: number
  registrationDate: string
  status: string
  medicalHistory: string
  gender?: string
  address?: string
}

export class ExcelExportService {
  // Convert data to CSV format
  private static arrayToCSV(data: any[], headers: string[]): string {
    const csvRows = []

    // Add headers
    csvRows.push(headers.join(","))

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header] || ""
        // Escape commas and quotes in CSV
        return typeof value === "string" && (value.includes(",") || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value
      })
      csvRows.push(values.join(","))
    }

    return csvRows.join("\n")
  }

  // Download CSV file
  private static downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Export patient data
  static exportPatients(patients: PatientData[]): void {
    const headers = [
      "patientId",
      "name",
      "email",
      "phone",
      "age",
      "registrationDate",
      "totalSessions",
      "completedSessions",
      "remainingBalance",
      "paymentType",
      "lastVisit",
      "medicalHistory",
    ]

    const csvContent = this.arrayToCSV(patients, headers)
    const filename = `patients_export_${new Date().toISOString().split("T")[0]}.csv`
    this.downloadCSV(csvContent, filename)
  }

  // Export appointment data
  static exportAppointments(appointments: AppointmentData[]): void {
    const headers = ["appointmentId", "patientId", "patientName", "date", "time", "type", "status", "createdAt"]

    const csvContent = this.arrayToCSV(appointments, headers)
    const filename = `appointments_export_${new Date().toISOString().split("T")[0]}.csv`
    this.downloadCSV(csvContent, filename)
  }

  // Export payment data
  static exportPayments(payments: PaymentData[]): void {
    const headers = ["paymentId", "patientId", "patientName", "amount", "paymentType", "method", "status", "date"]

    const csvContent = this.arrayToCSV(payments, headers)
    const filename = `payments_export_${new Date().toISOString().split("T")[0]}.csv`
    this.downloadCSV(csvContent, filename)
  }

  // Export registration data
  static exportRegistrations(registrations: RegistrationData[]): void {
    const headers = [
      "id",
      "name",
      "email",
      "phone",
      "age",
      "registrationDate",
      "status",
      "medicalHistory",
      "gender",
      "address",
    ]

    const csvContent = this.arrayToCSV(registrations, headers)
    const filename = `registrations_export_${new Date().toISOString().split("T")[0]}.csv`
    this.downloadCSV(csvContent, filename)
  }

  // Export comprehensive clinic report
  static exportClinicReport(data: {
    patients: PatientData[]
    appointments: AppointmentData[]
    payments: PaymentData[]
    registrations: RegistrationData[]
  }): void {
    // Create summary statistics
    const summary = {
      totalPatients: data.patients.length,
      totalAppointments: data.appointments.length,
      totalRevenue: data.payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0),
      pendingRegistrations: data.registrations.filter((r) => r.status === "pending").length,
      completedSessions: data.patients.reduce((sum, p) => sum + p.completedSessions, 0),
      exportDate: new Date().toISOString().split("T")[0],
    }

    // Create comprehensive report
    const reportData = [
      ["CLINIC MANAGEMENT REPORT"],
      ["Generated on:", summary.exportDate],
      [""],
      ["SUMMARY STATISTICS"],
      ["Total Patients:", summary.totalPatients],
      ["Total Appointments:", summary.totalAppointments],
      ["Total Revenue (₹):", summary.totalRevenue],
      ["Pending Registrations:", summary.pendingRegistrations],
      ["Completed Sessions:", summary.completedSessions],
      [""],
      ["DETAILED DATA SECTIONS"],
      ["1. Patient Data"],
      ["2. Appointment Data"],
      ["3. Payment Data"],
      ["4. Registration Data"],
    ]

    const csvContent = reportData.map((row) => row.join(",")).join("\n")
    const filename = `clinic_report_${summary.exportDate}.csv`
    this.downloadCSV(csvContent, filename)
  }
}
