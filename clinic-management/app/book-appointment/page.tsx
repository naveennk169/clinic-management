"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Heart, ArrowLeft, Calendar, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function BookAppointmentPage() {
  const { toast } = useToast()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
    medicalHistory: "",
    currentMedications: "",
    allergies: "",
    previousSurgeries: "",
    smokingStatus: "",
    alcoholConsumption: "",
    exerciseFrequency: "",
    chronicConditions: [] as string[],
    symptoms: "",
    additionalNotes: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (condition: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      chronicConditions: checked
        ? [...prev.chronicConditions, condition]
        : prev.chronicConditions.filter((c) => c !== condition),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.age || !formData.gender) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setIsSubmitted(true)
        toast({
          title: "Appointment Request Submitted",
          description: "We'll contact you within 24 hours to confirm your appointment.",
        })
      } else {
        toast({
          title: "Submission Failed",
          description: result.message || "Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Appointment Request Submitted</CardTitle>
            <CardDescription className="text-base">
              Thank you for choosing Surya's Speech and Language Clinic. We have received your appointment request.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-2">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Our staff will review your information</li>
                <li>• We'll call you within 24 hours to confirm</li>
                <li>• You'll receive appointment details via SMS/email</li>
                <li>• After your visit, you'll get login credentials</li>
              </ul>
            </div>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Surya's Speech and Language Clinic</h1>
                <p className="text-xs text-muted-foreground">Children and Adults</p>
              </div>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Form Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Book Your First Appointment</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Please fill out this form completely. Our medical team will review your information and contact you to
              schedule your appointment.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Please provide your basic contact and demographic information.</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="25"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Your home address"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Health Questionnaire */}
            <Card>
              <CardHeader>
                <CardTitle>Health Questionnaire</CardTitle>
                <CardDescription>Please answer these questions to help us provide better care.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Textarea
                    id="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                    placeholder="Please describe any significant medical history, past illnesses, or conditions"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentMedications">Current Medications</Label>
                  <Textarea
                    id="currentMedications"
                    value={formData.currentMedications}
                    onChange={(e) => handleInputChange("currentMedications", e.target.value)}
                    placeholder="List all medications, supplements, and vitamins you are currently taking"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    placeholder="List any known allergies to medications, foods, or other substances"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousSurgeries">Previous Surgeries</Label>
                  <Textarea
                    id="previousSurgeries"
                    value={formData.previousSurgeries}
                    onChange={(e) => handleInputChange("previousSurgeries", e.target.value)}
                    placeholder="List any previous surgeries or procedures with approximate dates"
                    rows={2}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Smoking Status</Label>
                    <RadioGroup
                      value={formData.smokingStatus}
                      onValueChange={(value) => handleInputChange("smokingStatus", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="never" id="never-smoked" />
                        <Label htmlFor="never-smoked">Never smoked</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="former" id="former-smoker" />
                        <Label htmlFor="former-smoker">Former smoker</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="current" id="current-smoker" />
                        <Label htmlFor="current-smoker">Current smoker</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Alcohol Consumption</Label>
                    <RadioGroup
                      value={formData.alcoholConsumption}
                      onValueChange={(value) => handleInputChange("alcoholConsumption", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="no-alcohol" />
                        <Label htmlFor="no-alcohol">None</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="occasional" id="occasional-alcohol" />
                        <Label htmlFor="occasional-alcohol">Occasional</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="regular" id="regular-alcohol" />
                        <Label htmlFor="regular-alcohol">Regular</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Exercise Frequency</Label>
                  <RadioGroup
                    value={formData.exerciseFrequency}
                    onValueChange={(value) => handleInputChange("exerciseFrequency", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="no-exercise" />
                      <Label htmlFor="no-exercise">No regular exercise</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1-2" id="light-exercise" />
                      <Label htmlFor="light-exercise">1-2 times per week</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3-4" id="moderate-exercise" />
                      <Label htmlFor="moderate-exercise">3-4 times per week</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="5+" id="frequent-exercise" />
                      <Label htmlFor="frequent-exercise">5+ times per week</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Do you have any of the following chronic conditions?</Label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      "Diabetes",
                      "High Blood Pressure",
                      "Heart Disease",
                      "Asthma",
                      "Arthritis",
                      "Depression/Anxiety",
                      "Kidney Disease",
                      "Liver Disease",
                    ].map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={condition}
                          checked={formData.chronicConditions.includes(condition)}
                          onCheckedChange={(checked) => handleCheckboxChange(condition, checked as boolean)}
                        />
                        <Label htmlFor={condition}>{condition}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms">Current Symptoms or Concerns</Label>
                  <Textarea
                    id="symptoms"
                    value={formData.symptoms}
                    onChange={(e) => handleInputChange("symptoms", e.target.value)}
                    placeholder="Describe any current symptoms, pain, or health concerns you'd like to discuss"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="text-center">
              <Button type="submit" size="lg" className="px-12 py-6 text-lg font-semibold" disabled={isSubmitting}>
                <Calendar className="mr-2 h-5 w-5" />
                {isSubmitting ? "Submitting..." : "Submit Appointment Request"}
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                By submitting this form, you agree to our privacy policy and terms of service.
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
