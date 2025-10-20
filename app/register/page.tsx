"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Loader from "@/components/Loader";

export default function RegisterPage() {
  // --- STATES ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // ✅ loader state

  const router = useRouter();
  const supabase = createClient();

  // --- REGISTER HANDLER ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true); // ✅ start showing loader

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name, // ✅ Pass user name to Supabase
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMessage("Registration successful! You can now log in.");
      setTimeout(() => router.push("/Verify"), 2000);
    }
  };

  // ✅ Show loader while registering
  if (loading) {
    return <Loader/>;
  }

  // --- UI CONTENT ---
  const benefits = [
    "असीमित दस्तावेज़ अपलोड",
    "AI सहायक से 24/7 सहायता",
    "विशेषज्ञ कानूनी सलाह",
    "सुरक्षित क्लाउड स्टोरेज",
    "मोबाइल ऐप एक्सेस",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* LEFT SECTION */}
        <div className="hidden lg:block">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              आज ही शुरू करें
            </h2>
            <p className="text-lg text-gray-600">
              हजारों लोग पहले से ही हमारी सेवा का उपयोग कर रहे हैं
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              आपको मिलेगा:
            </h3>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium">
                🎉 पहले 30 दिन बिल्कुल मुफ्त!
              </p>
              <p className="text-green-700 text-sm mt-1">
                कोई छुपी हुई फीस नहीं, कभी भी रद्द करें
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - FORM */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                नया खाता बनाएं
              </CardTitle>
              <p className="text-gray-600 mt-2">
                कुछ ही मिनटों में अपना खाता बनाएं और शुरू करें
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <p className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                  </p>
                )}
                {message && (
                  <p className="p-3 bg-green-50 text-green-700 rounded-md text-sm">
                    {message}
                  </p>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">ईमेल पता</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="आपका ईमेल पता"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">पूरा नाम</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="आपका पूरा नाम"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">पासवर्ड</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="एक मजबूत पासवर्ड बनाएं"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">पासवर्ड की पुष्टि करें</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="पासवर्ड दोबारा दर्ज करें"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) =>
                        setAgreeToTerms(checked as boolean)
                      }
                      required
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm text-gray-600 leading-relaxed"
                    >
                      मैं{" "}
                      <Link
                        href="/terms"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        नियम और शर्तों
                      </Link>{" "}
                      से सहमत हूं
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  disabled={!agreeToTerms}
                >
                  खाता बनाएं
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="text-center">
                  <p className="text-gray-600">
                    पहले से खाता है?{" "}
                    <Link
                      href="/login"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      लॉगिन करें
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
