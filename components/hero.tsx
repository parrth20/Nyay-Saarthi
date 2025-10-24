// components/hero.tsx
"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card" // Only Card needed, not specific parts like CardContent
import { Upload, FileText, CheckCircle, Shield, Sparkles, Users, Award } from "lucide-react"
import { useState, useEffect, useCallback } from "react" // Import useCallback
import Link from "next/link"

export function Hero() {
  const [dragActive, setDragActive] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Combined drag handler using useCallback
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, []);

  // Drop handler using useCallback
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    // Handle file upload logic here if needed directly (e.g., redirecting with files)
    // For now, it just deactivates the drag state.
    // Consider redirecting to /upload or using a shared state/context.
    console.log("Files dropped on hero:", e.dataTransfer.files);
    // Example redirection (if you want dropping here to start upload):
    // router.push('/upload'); // Requires importing useRouter
  }, []); // Add dependencies if needed, e.g. [router]


  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
       {/* Background Elements */}
       <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50">
         <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl animate-float"></div>
         <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-float animate-delay-200"></div>
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-green-100/20 to-emerald-100/20 rounded-full blur-3xl"></div>
       </div>
       <div className="absolute inset-0 opacity-5">
         <img src="/legal-pattern.jpg" alt="Legal pattern background" className="w-full h-full object-cover" />
       </div>

      <div className="container mx-auto max-w-7xl px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className={`space-y-8 ${isVisible ? "animate-slide-in-left" : "opacity-0"}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-6 py-3 rounded-full text-sm font-semibold shadow-lg animate-scale-in">
                <Shield className="w-5 h-5" />
                <span>भरोसेमंद और सुरक्षित AI तकनीक</span>
                <Sparkles className="w-4 h-4 text-green-600" />
              </div>

              {/* Heading */}
               <h1 className="text-5xl lg:text-7xl font-bold text-balance leading-tight animate-fade-in-up animate-delay-100">
                 <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                   कानूनी दस्तावेज़ों
                 </span>{" "}
                 को
                 <br />
                 <span className="text-gray-900">सरल भाषा में</span>
                 <br />
                 <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">समझें</span>
               </h1>

              {/* Subheading */}
               <p className="text-xl lg:text-2xl text-gray-600 text-balance max-w-xl leading-relaxed animate-fade-in-up animate-delay-200">
                 जटिल कानूनी भाषा को आसान हिंदी में बदलें। अनुबंध, नीतियां और कानूनी दस्तावेज़ों को
                 <span className="font-semibold text-green-600"> मिनटों में समझें।</span>
               </p>

              {/* Buttons */}
               <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animate-delay-300">
                 <Link href="/upload">
                   <Button
                     size="lg"
                     className="text-lg px-8 py-6 bg-green-900 bg-gradient-to-r from-green-800 to-emerald-800 hover:from-green-900 hover:to-emerald-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold border-0"
                     style={{
                       textShadow: "0 2px 4px rgba(0, 0, 0, 0.8), 0 4px 8px rgba(0, 0, 0, 0.5)",
                       backgroundColor: "#1f2937", // Fallback dark color
                     }}
                   >
                     <Upload className="w-6 h-6 mr-3" />
                     दस्तावेज़ अपलोड करें
                   </Button>
                 </Link>
                 <Link href="/chat">
                   <Button
                     variant="outline"
                     size="lg"
                     className="text-lg px-8 py-6 border-2 border-green-800 text-green-800 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all duration-300 bg-white font-semibold"
                   >
                     <FileText className="w-6 h-6 mr-3" />
                     AI से पूछें
                   </Button>
                 </Link>
               </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-8 pt-8 animate-fade-in-up animate-delay-400">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">50,000+</div>
                    <div className="text-sm text-gray-600">खुश उपयोगकर्ता</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">99.9%</div>
                    <div className="text-sm text-gray-600">सटीकता दर</div>
                  </div>
                </div>
              </div>
          </div>

          {/* Right Content - Upload Area */}
          <div className={`${isVisible ? "animate-slide-in-right animate-delay-200" : "opacity-0"}`}>
            <Card
              className={`p-8 border-2 border-dashed transition-all duration-300 bg-white/80 backdrop-blur-sm shadow-2xl hover:shadow-3xl ${
                // Enhanced drag active styles
                dragActive
                 ? "border-green-400 scale-[1.03] ring-4 ring-green-400/30"
                 : "border-green-200 hover:border-green-400 transform hover:scale-[1.02]"
              }`}
              onDragEnter={handleDrag} // Use combined handler
              onDragLeave={handleDrag} // Use combined handler
              onDragOver={handleDrag}  // Use combined handler
              onDrop={handleDrop}      // Use drop handler
            >
              <div
                className={`text-center py-16 rounded-2xl transition-all duration-300 ${
                  // Consistent background feedback
                  dragActive ? "bg-green-100/50" : "hover:bg-green-50/50"
                }`}
                // Event handlers moved to parent Card
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
                  <Upload className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-4 text-gray-900">अपना दस्तावेज़ यहाँ खींचें</h3>

                <p className="text-gray-600 mb-8 text-lg">
                  PDF, DOCX, या टेक्स्ट फाइल अपलोड करें
                  <br />
                  <span className="text-sm text-green-600 font-medium">(अधिकतम 10MB)</span>
                </p>

                <Link href="/upload">
                  <Button
                    variant="outline"
                    size="lg"
                    className="mb-6 border-2 border-green-800 text-green-800 hover:bg-green-50 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                  >
                    फाइल चुनें
                  </Button>
                </Link>

                <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">100% सुरक्षित</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">पूर्ण निजता</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">तुरंत परिणाम</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}