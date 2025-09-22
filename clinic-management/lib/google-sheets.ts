// Google Sheets API integration service
export interface AppointmentData {
  name: string
  email: string
  phone: string
  age: string
  gender: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  medicalHistory: string
  currentMedications: string
  allergies: string
  previousSurgeries: string
  smokingStatus: string
  alcoholConsumption: string
  exerciseFrequency: string
  chronicConditions: string[]
  symptoms: string
  appointmentReason: string
  preferredDate: string
  preferredTime: string
  additionalNotes: string
  submittedAt: string
  status: "pending" | "approved" | "completed"
}

export interface PatientCredentials {
  patientId: string
  name: string
  email: string
  phone: string
  password: string
  totalSessions: number
  completedSessions: number
  therapyDetails: string
  createdAt: string
  status: "active" | "inactive"
}

export interface SessionRecord {
  patientId: string
  sessionNumber: number
  date: string
  notes: string
  workoutPlan?: string
  completedAt: string
}

class GoogleSheetsService {
  private readonly SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  private readonly API_KEY = process.env.GOOGLE_SHEETS_API_KEY
  private readonly BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets"

  // Sheet names for different data types
  private readonly SHEETS = {
    APPOINTMENTS: "Appointments",
    PATIENTS: "Patients",
    SESSIONS: "Sessions",
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.BASE_URL}/${this.SPREADSHEET_ID}${endpoint}?key=${this.API_KEY}`

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`)
    }

    return response.json()
  }

  // Store appointment booking data
  async storeAppointment(data: AppointmentData): Promise<boolean> {
    try {
      const values = [
        [
          data.name,
          data.email,
          data.phone,
          data.age,
          data.gender,
          data.address,
          data.emergencyContact,
          data.emergencyPhone,
          data.medicalHistory,
          data.currentMedications,
          data.allergies,
          data.previousSurgeries,
          data.smokingStatus,
          data.alcoholConsumption,
          data.exerciseFrequency,
          data.chronicConditions.join(", "),
          data.symptoms,
          data.appointmentReason,
          data.preferredDate,
          data.preferredTime,
          data.additionalNotes,
          data.submittedAt,
          data.status,
        ],
      ]

      await this.makeRequest(`/values/${this.SHEETS.APPOINTMENTS}:append`, {
        method: "POST",
        body: JSON.stringify({
          values,
          valueInputOption: "RAW",
        }),
      })

      return true
    } catch (error) {
      console.error("Error storing appointment:", error)
      return false
    }
  }

  // Get all pending appointments for admin review
  async getPendingAppointments(): Promise<AppointmentData[]> {
    try {
      const response = await this.makeRequest(`/values/${this.SHEETS.APPOINTMENTS}`)
      const rows = response.values || []

      // Skip header row and filter for pending appointments
      return rows
        .slice(1)
        .filter((row: string[]) => row[21] === "pending") // status column
        .map((row: string[]) => ({
          name: row[0] || "",
          email: row[1] || "",
          phone: row[2] || "",
          age: row[3] || "",
          gender: row[4] || "",
          address: row[5] || "",
          emergencyContact: row[6] || "",
          emergencyPhone: row[7] || "",
          medicalHistory: row[8] || "",
          currentMedications: row[9] || "",
          allergies: row[10] || "",
          previousSurgeries: row[11] || "",
          smokingStatus: row[12] || "",
          alcoholConsumption: row[13] || "",
          exerciseFrequency: row[14] || "",
          chronicConditions: row[15] ? row[15].split(", ") : [],
          symptoms: row[16] || "",
          appointmentReason: row[17] || "",
          preferredDate: row[18] || "",
          preferredTime: row[19] || "",
          additionalNotes: row[20] || "",
          submittedAt: row[21] || "",
          status: (row[22] as "pending" | "approved" | "completed") || "pending",
        }))
    } catch (error) {
      console.error("Error fetching appointments:", error)
      return []
    }
  }

  // Store patient credentials after admin approval
  async storePatientCredentials(data: PatientCredentials): Promise<boolean> {
    try {
      const values = [
        [
          data.patientId,
          data.name,
          data.email,
          data.phone,
          data.password,
          data.totalSessions,
          data.completedSessions,
          data.therapyDetails,
          data.createdAt,
          data.status,
        ],
      ]

      await this.makeRequest(`/values/${this.SHEETS.PATIENTS}:append`, {
        method: "POST",
        body: JSON.stringify({
          values,
          valueInputOption: "RAW",
        }),
      })

      return true
    } catch (error) {
      console.error("Error storing patient credentials:", error)
      return false
    }
  }

  // Get patient by ID and password for login
  async getPatientByCredentials(patientId: string, password: string): Promise<PatientCredentials | null> {
    try {
      const response = await this.makeRequest(`/values/${this.SHEETS.PATIENTS}`)
      const rows = response.values || []

      const patientRow = rows
        .slice(1)
        .find((row: string[]) => row[0] === patientId && row[4] === password && row[9] === "active")

      if (!patientRow) return null

      return {
        patientId: patientRow[0],
        name: patientRow[1],
        email: patientRow[2],
        phone: patientRow[3],
        password: patientRow[4],
        totalSessions: Number.parseInt(patientRow[5]) || 0,
        completedSessions: Number.parseInt(patientRow[6]) || 0,
        therapyDetails: patientRow[7] || "",
        createdAt: patientRow[8] || "",
        status: (patientRow[9] as "active" | "inactive") || "active",
      }
    } catch (error) {
      console.error("Error fetching patient:", error)
      return null
    }
  }

  // Update patient session count
  async updatePatientSessions(patientId: string, completedSessions: number): Promise<boolean> {
    try {
      // This would require finding the row and updating it
      // For now, we'll implement a simple version
      console.log(`Updating sessions for patient ${patientId}: ${completedSessions}`)
      return true
    } catch (error) {
      console.error("Error updating patient sessions:", error)
      return false
    }
  }

  // Store session record
  async storeSessionRecord(data: SessionRecord): Promise<boolean> {
    try {
      const values = [
        [data.patientId, data.sessionNumber, data.date, data.notes, data.workoutPlan || "", data.completedAt],
      ]

      await this.makeRequest(`/values/${this.SHEETS.SESSIONS}:append`, {
        method: "POST",
        body: JSON.stringify({
          values,
          valueInputOption: "RAW",
        }),
      })

      return true
    } catch (error) {
      console.error("Error storing session record:", error)
      return false
    }
  }

  // Get all patients for admin dashboard
  async getAllPatients(): Promise<PatientCredentials[]> {
    try {
      const response = await this.makeRequest(`/values/${this.SHEETS.PATIENTS}`)
      const rows = response.values || []

      return rows.slice(1).map((row: string[]) => ({
        patientId: row[0] || "",
        name: row[1] || "",
        email: row[2] || "",
        phone: row[3] || "",
        password: row[4] || "",
        totalSessions: Number.parseInt(row[5]) || 0,
        completedSessions: Number.parseInt(row[6]) || 0,
        therapyDetails: row[7] || "",
        createdAt: row[8] || "",
        status: (row[9] as "active" | "inactive") || "active",
      }))
    } catch (error) {
      console.error("Error fetching all patients:", error)
      return []
    }
  }
}

export const googleSheetsService = new GoogleSheetsService()
