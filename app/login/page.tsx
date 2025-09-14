"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Users, FileText } from "lucide-react"

export default function LoginPage() {
  // --- WORKING LOGIN LOGIC ---
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Failed to log in. Please check your credentials.")
      setIsLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }
  // --- END OF LOGIN LOGIC ---

  // --- YOUR ORIGINAL UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">स्वागत है वापस!</CardTitle>
              <p className="text-gray-600 mt-2">अपने खाते में लॉगिन करें और अपने कानूनी दस्तावेज़ों को सरल बनाएं</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">ईमेल पता</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="आपका ईमेल दर्ज करें"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">पासवर्ड</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="आपका पासवर्ड दर्ज करें"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      मुझे याद रखें
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                    पासवर्ड भूल गए?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      लॉगिन हो रहा है...
                    </>
                  ) : (
                    <>
                      लॉगिन करें
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-gray-600">
                    खाता नहीं है?{" "}
                    <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                      अभी रजिस्टर करें
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="hidden lg:block">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">कानूनी दस्तावेज़ सरलीकरण</h2>
            <p className="text-lg text-gray-600">AI की शक्ति से जटिल कानूनी भाषा को सरल हिंदी में समझें</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-lg">
              <div className="p-3 bg-green-100 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">तुरंत विश्लेषण</h3>
                <p className="text-gray-600">अपने दस्तावेज़ अपलोड करें और सेकंडों में सरल भाषा में समझें</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-lg">
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">सुरक्षित और निजी</h3>
                <p className="text-gray-600">आपके दस्तावेज़ पूर्णतः सुरक्षित हैं और केवल आप ही देख सकते हैं</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-lg">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">विशेषज्ञ सहायता</h3>
                <p className="text-gray-600">AI सहायक से पूछें या कानूनी विशेषज्ञों से सलाह लें</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}