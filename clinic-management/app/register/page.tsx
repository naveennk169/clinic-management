"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
    emergencyContact: "",
    medicalHistory: "",
    currentMedications: "",
    allergies: "",
    previousTreatments: "",
    consent: false,
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.consent) {
      toast({
        title: "Consent Required",
        description: "Please provide consent to proceed with registration.",
        variant: "destructive",
      })
      return
    }

    try {
      // Get existing registrations from localStorage
      const existingRegistrations = JSON.parse(localStorage.getItem("patient_registrations") || "[]")

      // Create new registration with unique ID and timestamp
      const newRegistration = {
        id: Date.now(), // Simple ID generation
        ...formData,
        registrationDate: new Date().toISOString().split("T")[0],
        status: "pending",
        timestamp: new Date().toISOString(),
      }

      // Add to existing registrations
      const updatedRegistrations = [...existingRegistrations, newRegistration]

      // Save back to localStorage
      localStorage.setItem("patient_registrations", JSON.stringify(updatedRegistrations))

      console.log("Patient registration data saved:", newRegistration)

      // Simulate SMS acknowledgment
      toast({
        title: "Registration Successful!",
        description: `SMS acknowledgment sent to ${formData.phone}`,
      })

      setIsSubmitted(true)
    } catch (error) {
      console.error("Registration save error:", error)
      toast({
        title: "Registration Failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-600">Registration Successful!</CardTitle>
            <CardDescription className="text-lg">Thank you for registering with HealthCare Clinic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">📱 SMS acknowledgment sent to:</p>
              <p className="font-semibold">{formData.phone}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Next Steps:</strong>
                <br />
                1. Visit our clinic for consultation
                <br />
                2. Doctor will create your patient ID
                <br />
                3. You'll receive login credentials
                <br />
                4. Access patient portal to book appointments
              </p>
            </div>
            <Link href="/">
              <Button className="w-full">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-semibold">HealthCare Clinic</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Patient Registration</h1>
          <p className="text-muted-foreground">Please fill out all required information to register as a new patient</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic details about yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Gender *</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder="Name and phone number"
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Help us understand your medical background</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                  placeholder="Any chronic conditions, surgeries, or significant medical events"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="currentMedications">Current Medications</Label>
                <Textarea
                  id="currentMedications"
                  value={formData.currentMedications}
                  onChange={(e) => handleInputChange("currentMedications", e.target.value)}
                  placeholder="List all medications you are currently taking"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange("allergies", e.target.value)}
                  placeholder="Food allergies, drug allergies, environmental allergies"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="previousTreatments">Previous Treatments</Label>
                <Textarea
                  id="previousTreatments"
                  value={formData.previousTreatments}
                  onChange={(e) => handleInputChange("previousTreatments", e.target.value)}
                  placeholder="Any previous therapy or treatment experiences"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Consent */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={(checked) => handleInputChange("consent", checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="consent"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I consent to treatment and data processing *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    I agree to the collection and processing of my personal and medical information for the purpose of
                    providing healthcare services. I understand that this information will be kept confidential and used
                    only for medical purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg">
            Register Patient
          </Button>
        </form>
      </div>
    </div>
  )
}
