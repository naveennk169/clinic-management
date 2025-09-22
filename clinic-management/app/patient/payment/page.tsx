"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Heart, CreditCard, ArrowLeft, CheckCircle, Receipt } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ProtectedRoute } from "@/components/protected-route"
import { paymentPlans, paymentService, type PaymentRecord } from "@/lib/payment"

function PaymentPageContent() {
  const [selectedPlan, setSelectedPlan] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([])
  const [currentBalance, setCurrentBalance] = useState({ balance: 0, remainingSessions: 0 })

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.patientId) {
      const payments = paymentService.getPatientPayments(user.patientId)
      setPaymentHistory(payments)

      const balance = paymentService.getCurrentBalance(user.patientId)
      setCurrentBalance(balance)
    }
  }, [user])

  const handlePayment = async () => {
    if (!selectedPlan || !paymentMethod || !user?.patientId) {
      toast({
        title: "Missing Information",
        description: "Please select a payment plan and method",
        variant: "destructive",
      })
      return
    }

    if (paymentMethod === "card" && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      toast({
        title: "Card Details Required",
        description: "Please fill in all card details",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const paymentRecord = await paymentService.processPayment(user.patientId, selectedPlan, paymentMethod)

      if (paymentRecord) {
        toast({
          title: "Payment Successful!",
          description: `Payment of ₹${paymentRecord.amount} processed successfully`,
        })

        // Refresh payment history and balance
        const updatedPayments = paymentService.getPatientPayments(user.patientId)
        setPaymentHistory(updatedPayments)

        const updatedBalance = paymentService.getCurrentBalance(user.patientId)
        setCurrentBalance(updatedBalance)

        // Reset form
        setSelectedPlan("")
        setPaymentMethod("")
        setCardDetails({ number: "", expiry: "", cvv: "", name: "" })
      } else {
        toast({
          title: "Payment Failed",
          description: "Payment could not be processed. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An error occurred during payment processing",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedPlanDetails = paymentPlans.find((p) => p.id === selectedPlan)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/patient/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-semibold">HealthCare Clinic - Payment</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Payment Management</h1>
          <p className="text-muted-foreground">Choose your payment plan and manage your therapy sessions</p>
        </div>

        {/* Current Balance */}
        {currentBalance.remainingSessions > 0 && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Active Payment Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Remaining Balance</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">₹{currentBalance.balance}</p>
                </div>
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Sessions Remaining</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {currentBalance.remainingSessions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Plans */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Payment Plan</CardTitle>
              <CardDescription>Select how you'd like to pay for your therapy sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-4">
                {paymentPlans.map((plan) => (
                  <div key={plan.id} className="flex items-start space-x-3">
                    <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={plan.id} className="cursor-pointer">
                        <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{plan.name}</h3>
                            <Badge variant={plan.type === "upfront" ? "default" : "secondary"}>
                              {plan.type === "upfront" ? "Best Value" : "Flexible"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-2xl font-bold">₹{plan.totalAmount}</span>
                              {plan.type === "upfront" && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  (₹{plan.pricePerSession}/session)
                                </span>
                              )}
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              {plan.sessionsIncluded} session{plan.sessionsIncluded > 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose how you'd like to pay</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="netbanking">Net Banking</SelectItem>
                  <SelectItem value="cash">Cash (Pay at Clinic)</SelectItem>
                </SelectContent>
              </Select>

              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails((prev) => ({ ...prev, number: e.target.value }))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails((prev) => ({ ...prev, expiry: e.target.value }))}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails((prev) => ({ ...prev, cvv: e.target.value }))}
                        placeholder="123"
                        maxLength={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div>
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input id="upiId" placeholder="yourname@upi" />
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    <strong>Cash Payment:</strong> You can pay at the clinic during your visit. Please bring exact
                    change if possible.
                  </p>
                </div>
              )}

              {selectedPlanDetails && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Payment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <span>{selectedPlanDetails.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sessions:</span>
                      <span>{selectedPlanDetails.sessionsIncluded}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount:</span>
                      <span>₹{selectedPlanDetails.totalAmount}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button onClick={handlePayment} className="w-full" disabled={isProcessing || !selectedPlan}>
                <CreditCard className="h-4 w-4 mr-2" />
                {isProcessing ? "Processing Payment..." : `Pay ₹${selectedPlanDetails?.totalAmount || 0}`}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription>Your previous payments and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => {
                    const plan = paymentPlans.find((p) => p.id === payment.planId)
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.paymentDate}</TableCell>
                        <TableCell>{plan?.name}</TableCell>
                        <TableCell className="font-medium">₹{payment.amount}</TableCell>
                        <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                        <TableCell>
                          {payment.remainingSessions}/{payment.sessionsPaid}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === "completed"
                                ? "default"
                                : payment.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <ProtectedRoute requiredRole="patient" redirectTo="/login">
      <PaymentPageContent />
    </ProtectedRoute>
  )
}
