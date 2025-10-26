"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Phone, Mail, Clock, Video, CreditCard, CheckCircle, Star, Users, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SupportPage() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "medium",
  })
  const router=useRouter();

  const handleInputChange = (field: string, value: string) => {
    setContactForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Support form submitted:", contactForm)
  }

  const consultationPlans = [
    {
      id: "instant",
      name: "तत्काल सहायता",
      price: "₹299",
      duration: "15 मिनट",
      description: "तुरंत कानूनी सलाह पाएं",
      features: ["तत्काल चैट सपोर्ट", "दस्तावेज़ की त्वरित समीक्षा", "बुनियादी कानूनी सलाह", "ईमेल सारांश"],
      popular: false,
      icon: Zap,
      color: "from-orange-500 to-red-500",
    },
    {
      id: "consultation",
      name: "विस्तृत परामर्श",
      price: "₹799",
      duration: "45 मिनट",
      description: "विशेषज्ञ से विस्तृत चर्चा",
      features: ["वीडियो कॉल परामर्श", "विस्तृत दस्तावेज़ विश्लेषण", "कानूनी रणनीति सुझाव", "फॉलो-अप ईमेल", "रिकॉर्डेड सेशन"],
      popular: true,
      icon: Video,
      color: "from-blue-500 to-purple-500",
    },
    {
      id: "premium",
      name: "प्रीमियम सेवा",
      price: "₹1,499",
      duration: "90 मिनट",
      description: "संपूर्ण कानूनी समाधान",
      features: ["वरिष्ठ वकील से परामर्श", "संपूर्ण केस विश्लेषण", "कानूनी दस्तावेज़ तैयारी", "असीमित फॉलो-अप", "प्राथमिकता सहायता"],
      popular: false,
      icon: Star,
      color: "from-purple-500 to-pink-500",
    },
  ]

  const supportOptions = [
    {
      title: "लाइव चैट",
      description: "तुरंत सहायता पाएं",
      icon: MessageSquare,
      availability: "24/7 उपलब्ध",
      action: "चैट शुरू करें",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "फोन सपोर्ट",
      description: "सीधे बात करें",
      icon: Phone,
      availability: "सुबह 9 - रात 9",
      action: "+91 98765 43210",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "ईमेल सपोर्ट",
      description: "विस्तृत सहायता",
      icon: Mail,
      availability: "24 घंटे में जवाब",
      action: "help@legalsimplify.in",
      color: "bg-purple-100 text-purple-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="py-8">
        <div className="max-w-6xl mx-auto text-center px-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">सहायता केंद्र</h1>
          <p className="text-lg text-gray-600">हम आपकी हर समस्या का समाधान करने के लिए यहाँ हैं</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Quick Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {supportOptions.map((option, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex p-4 rounded-full ${option.color} mb-4`}>
                  <option.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-600 mb-3">{option.description}</p>
                <p className="text-sm text-gray-500 mb-4">{option.availability}</p>
                <Button className="w-full">{option.action}</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instant Consultation Plans */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">तत्काल कानूनी परामर्श</h2>
            <p className="text-gray-600">विशेषज्ञ वकीलों से तुरंत सलाह लें और अपनी समस्या का समाधान पाएं</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {consultationPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative hover:shadow-xl transition-all duration-300 ${plan.popular ? "ring-2 ring-blue-500 scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">सबसे लोकप्रिय</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div
                    className={`inline-flex p-4 rounded-full bg-gradient-to-r ${plan.color} text-white mb-4 mx-auto`}
                  >
                    <plan.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-gray-900 mt-2">
                    {plan.price}
                    <span className="text-sm font-normal text-gray-500">/{plan.duration}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full bg-gradient-to-r ${plan.color} text-white hover:opacity-90`} onClick={()=>router.push('/consultation')}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    अभी बुक करें
                  </Button>  
                  
                </CardContent>
               
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                संपर्क फॉर्म
              </CardTitle>
              <p className="text-gray-600">अपनी समस्या विस्तार से बताएं और हम 24 घंटे में जवाब देंगे</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">नाम</Label>
                    <Input
                      id="name"
                      placeholder="आपका नाम"
                      value={contactForm.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">ईमेल</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="आपका ईमेल"
                      value={contactForm.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">विषय</Label>
                  <Input
                    id="subject"
                    placeholder="आपकी समस्या का विषय"
                    value={contactForm.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">प्राथमिकता</Label>
                  <select
                    id="priority"
                    value={contactForm.priority}
                    onChange={(e) => handleInputChange("priority", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">कम</option>
                    <option value="medium">मध्यम</option>
                    <option value="high">उच्च</option>
                    <option value="urgent">तत्काल</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">संदेश</Label>
                  <Textarea
                    id="message"
                    placeholder="अपनी समस्या विस्तार से बताएं..."
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  संदेश भेजें
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* FAQ and Additional Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>अक्सर पूछे जाने वाले प्रश्न</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">क्या मेरे दस्तावेज़ सुरक्षित हैं?</h4>
                  <p className="text-sm text-gray-600">
                    हाँ, हम बैंक-स्तरीय एन्क्रिप्शन का उपयोग करते हैं और आपके दस्तावेज़ पूर्णतः सुरक्षित हैं।
                  </p>
                </div>
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">परामर्श कैसे बुक करें?</h4>
                  <p className="text-sm text-gray-600">ऊपर दिए गए प्लान में से कोई भी चुनें और "अभी बुक करें" पर क्लिक करें।</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">रिफंड पॉलिसी क्या है?</h4>
                  <p className="text-sm text-gray-600">यदि आप संतुष्ट नहीं हैं, तो 24 घंटे के भीतर पूरा रिफंड मिलेगा।</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  सहायता समय
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">चैट सपोर्ट:</span>
                    <span className="font-medium">24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">फोन सपोर्ट:</span>
                    <span className="font-medium">9:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ईमेल सपोर्ट:</span>
                    <span className="font-medium">24 घंटे में जवाब</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  हमारे विशेषज्ञ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  हमारी टीम में 50+ अनुभवी वकील हैं जो विभिन्न कानूनी क्षेत्रों में विशेषज्ञता रखते हैं।
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>• संपत्ति कानून</div>
                  <div>• व्यापारिक कानून</div>
                  <div>• पारिवारिक कानून</div>
                  <div>• श्रम कानून</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
