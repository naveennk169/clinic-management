import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Shield, Clock, Users, MapPin, Phone, Mail, Calendar } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">MediCare Clinic</h1>
                <p className="text-xs text-muted-foreground">Professional Healthcare</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="#services"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Services
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="#contact"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
              <Link href="/patient/login">
                <Button variant="outline" size="sm" className="text-sm bg-transparent">
                  Patient Login
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Admin Access
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto text-center max-w-5xl">
          <h2 className="text-5xl md:text-7xl font-bold text-balance mb-8 leading-tight">
            Excellence in
            <span className="text-primary"> Healthcare</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground text-balance mb-12 max-w-3xl mx-auto leading-relaxed">
            Professional medical care with personalized treatment plans. Your health journey starts with a simple
            appointment booking.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/book-appointment">
              <Button size="lg" className="text-lg px-12 py-6 h-auto font-semibold">
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-12 py-6 h-auto font-semibold bg-transparent">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6 text-balance">Our Medical Services</h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
              Comprehensive healthcare solutions tailored to your individual needs with state-of-the-art facilities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">General Consultation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Comprehensive health assessments and preventive care with experienced physicians.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Specialized Therapy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Physical therapy and rehabilitation programs designed for optimal recovery.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Family Medicine</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Complete healthcare for all family members from pediatrics to geriatrics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Emergency Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  24/7 emergency medical services with rapid response and expert care.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Preventive Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Regular health screenings and wellness programs to maintain optimal health.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Chronic Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Long-term management of chronic conditions with personalized treatment plans.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-bold mb-8 text-balance">Why Choose MediCare Clinic?</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Expert Medical Team</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Board-certified physicians and specialists with years of experience in their respective fields.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Modern Technology</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      State-of-the-art medical equipment and digital patient management systems.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Patient-Centered Care</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Personalized treatment plans focused on your individual health goals and needs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Heart className="h-24 w-24 text-primary mx-auto mb-4" />
                  <p className="text-2xl font-semibold text-primary">Your Health</p>
                  <p className="text-lg text-muted-foreground">Our Priority</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-6">Contact Information</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get in touch with us to schedule your appointment or for any inquiries.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center border-0 bg-card/50">
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-7 w-7 text-primary" />
                </div>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  123 Healthcare Avenue
                  <br />
                  Medical District
                  <br />
                  City, State 12345
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-card/50">
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <CardTitle>Phone</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Emergency: (555) 911-HELP
                  <br />
                  Appointments: (555) 123-CARE
                  <br />
                  General: (555) 456-7890
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 bg-card/50">
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  info@medicareClinic.com
                  <br />
                  appointments@medicareClinic.com
                  <br />
                  support@medicareClinic.com
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-4xl font-bold mb-6 text-balance">Ready to Start Your Health Journey?</h3>
            <p className="text-xl text-muted-foreground mb-10 text-balance leading-relaxed">
              Book your first appointment today and experience professional healthcare with personalized attention and
              modern medical technology.
            </p>
            <Link href="/book-appointment">
              <Button size="lg" className="text-lg px-12 py-6 h-auto font-semibold">
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">MediCare Clinic</h4>
                <p className="text-sm text-muted-foreground">Professional Healthcare</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-muted-foreground">© 2024 MediCare Clinic. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
