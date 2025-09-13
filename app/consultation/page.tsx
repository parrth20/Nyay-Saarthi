"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Clock, CreditCard, CheckCircle, Star, Video, MessageSquare, Shield } from "lucide-react"

export default function ConsultationPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedPlan, setSelectedPlan] = useState("consultation")
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    issue: "",
    documents: "",
  })

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
  ]

  const consultationPlans = [
    {
      id: "instant",
      name: "तत्काल सहायता",
      price: 299,
      duration: "15 मिनट",
      type: "चैट",
      description: "तुरंत कानूनी सलाह पाएं",
      features: ["तत्काल चैट सपोर्ट", "दस्तावेज़ की त्वरित समीक्षा", "बुनियादी कानूनी सलाह", "ईमेल सारांश"],
      icon: MessageSquare,
      color: "from-orange-500 to-red-500",
      available: "तुरंत उपलब्ध",
    },
    {
      id: "consultation",
      name: "विस्तृत परामर्श",
      price: 799,
      duration: "45 मिनट",
      type: "वीडियो कॉल",
      description: "विशेषज्ञ से विस्तृत चर्चा",
      features: ["वीडियो कॉल परामर्श", "विस्तृत दस्तावेज़ विश्लेषण", "कानूनी रणनीति सुझाव", "फॉलो-अप ईमेल", "रिकॉर्डेड सेशन"],
      icon: Video,
      color: "from-blue-500 to-purple-500",
      available: "आज से बुकिंग",
    },
    {
      id: "premium",
      name: "प्रीमियम सेवा",
      price: 1499,
      duration: "90 मिनट",
      type: "व्यक्तिगत मीटिंग",
      description: "संपूर्ण कानूनी समाधान",
      features: ["वरिष्ठ वकील से परामर्श", "संपूर्ण केस विश्लेषण", "कानूनी दस्तावेज़ तैयारी", "असीमित फॉलो-अप", "प्राथमिकता सहायता"],
      icon: Star,
      color: "from-purple-500 to-pink-500",
      available: "अग्रिम बुकिंग",
    },
  ]

  const handleInputChange = (field: string, value: string) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedPlanData = consultationPlans.find((plan) => plan.id === selectedPlan)
    console.log("Booking consultation:", {
      plan: selectedPlanData,
      date: selectedDate,
      time: selectedTime,
      form: bookingForm,
    })
  }

  const selectedPlanData = consultationPlans.find((plan) => plan.id === selectedPlan)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">कानूनी परामर्श बुक करें</h1>
          <p className="text-lg text-gray-600">विशेषज्ञ वकीलों से तुरंत सलाह लें और अपनी समस्या का समाधान पाएं</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan Selection */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>परामर्श प्लान चुनें</CardTitle>
                <p className="text-gray-600">अपनी आवश्यकता के अनुसार सबसे उपयुक्त प्लान चुनें</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {consultationPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                        selectedPlan === plan.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${plan.color} text-white mb-3`}>
                        <plan.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{plan.name}</h3>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ₹{plan.price}
                        <span className="text-sm font-normal text-gray-500">/{plan.duration}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{plan.type}</p>
                      <Badge variant="secondary" className="text-xs">
                        {plan.available}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Date and Time Selection */}
            {selectedPlan !== "instant" && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    दिनांक और समय चुनें
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-medium mb-3 block">दिनांक चुनें</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border"
                      />
                    </div>
                    <div>
                      <Label className="text-base font-medium mb-3 block">समय चुनें</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTime(time)}
                            className="text-sm"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle>बुकिंग विवरण</CardTitle>
                <p className="text-gray-600">अपनी जानकारी भरें और परामर्श बुक करें</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">पूरा नाम *</Label>
                      <Input
                        id="name"
                        placeholder="आपका पूरा नाम"
                        value={bookingForm.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">ईमेल पता *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="आपका ईमेल पता"
                        value={bookingForm.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">मोबाइल नंबर *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="आपका मोबाइल नंबर"
                      value={bookingForm.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issue">कानूनी समस्या का विवरण *</Label>
                    <Textarea
                      id="issue"
                      placeholder="अपनी कानूनी समस्या के बारे में विस्तार से बताएं..."
                      rows={4}
                      value={bookingForm.issue}
                      onChange={(e) => handleInputChange("issue", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documents">संबंधित दस्तावेज़ (वैकल्पिक)</Label>
                    <Textarea
                      id="documents"
                      placeholder="यदि आपके पास कोई संबंधित दस्तावेज़ हैं तो उनका विवरण दें..."
                      rows={2}
                      value={bookingForm.documents}
                      onChange={(e) => handleInputChange("documents", e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className={`w-full bg-gradient-to-r ${selectedPlanData?.color} text-white hover:opacity-90`}
                    size="lg"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />₹{selectedPlanData?.price} भुगतान करें और बुक करें
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>बुकिंग सारांश</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlanData && (
                  <>
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-full bg-gradient-to-r ${selectedPlanData.color} text-white`}>
                          <selectedPlanData.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{selectedPlanData.name}</h3>
                          <p className="text-sm text-gray-600">{selectedPlanData.type}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{selectedPlanData.description}</p>
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{selectedPlanData.price}
                        <span className="text-sm font-normal text-gray-500">/{selectedPlanData.duration}</span>
                      </div>
                    </div>

                    {selectedPlan !== "instant" && selectedDate && selectedTime && (
                      <div className="border-b pb-4">
                        <h4 className="font-medium text-gray-900 mb-2">चयनित समय</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{selectedDate.toLocaleDateString("hi-IN")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Clock className="h-4 w-4" />
                          <span>{selectedTime}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">शामिल सेवाएं:</h4>
                      <ul className="space-y-2">
                        {selectedPlanData.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">100% सुरक्षित भुगतान</span>
                      </div>
                      <p className="text-sm text-green-700">यदि आप संतुष्ट नहीं हैं, तो 24 घंटे के भीतर पूरा रिफंड</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
