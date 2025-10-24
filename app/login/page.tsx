// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Remove Label import from ui/label
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Users, FileText, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel, // Use hook-form's Label
  FormMessage,
} from "@/components/ui/form"; // Import hook-form components

// --- Zod Schema for Validation ---
const loginSchema = z.object({
  email: z.string().email({ message: "कृपया वैध ईमेल पता दर्ज करें।" }),
  password: z.string().min(1, { message: "कृपया पासवर्ड दर्ज करें।" }), // Changed min to 1 for presence check
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
// --- End Schema ---

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // --- React Hook Form Setup ---
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange", // Validate on change
  });
  // --- End Setup ---

  // --- Updated Login Handler ---
  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setServerError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    setIsLoading(false);

    if (error) {
      setServerError(error.message || "लॉगिन विफल। कृपया अपनी जानकारी जांचें।");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };
  // --- End Handler ---

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
              {/* --- Use Form Provider --- */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
                  {serverError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{serverError}</p>
                    </div>
                  )}

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor={field.name}>ईमेल पता</FormLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" /> {/* Added pointer-events-none */}
                          <FormControl>
                            <Input
                              id={field.name}
                              type="email"
                              placeholder="आपका ईमेल दर्ज करें"
                              className="pl-10"
                              disabled={isLoading}
                              aria-invalid={!!form.formState.errors.email} // Add aria-invalid
                              {...field}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor={field.name}>पासवर्ड</FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" /> {/* Added pointer-events-none */}
                          <FormControl>
                            <Input
                              id={field.name}
                              type={showPassword ? "text" : "password"}
                              placeholder="आपका पासवर्ड दर्ज करें"
                              className="pl-10 pr-10"
                              disabled={isLoading}
                              aria-invalid={!!form.formState.errors.password} // Add aria-invalid
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 p-1" // Added padding for easier click
                            disabled={isLoading}
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                     <FormField
                        control={form.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0"> {/* Adjusted spacing */}
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isLoading}
                                id={field.name}
                                aria-labelledby={`${field.name}-label`} // Link checkbox to label
                              />
                            </FormControl>
                            {/* Use a div or span for the label text next to checkbox */}
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor={field.name}
                                id={`${field.name}-label`} // ID for linking
                                className="text-sm font-medium leading-none text-gray-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                मुझे याद रखें
                              </label>
                            </div>
                           </FormItem>
                        )}
                      />
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                      पासवर्ड भूल गए?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white disabled:opacity-70" // Added disabled opacity
                    disabled={isLoading || !form.formState.isValid}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        लॉगिन हो रहा है...
                      </>
                    ) : (
                      <>
                        लॉगिन करें
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {/* Link to Register */}
                  <div className="text-center pt-2"> {/* Added pt-2 */}
                    <p className="text-sm text-gray-600"> {/* Made text slightly smaller */}
                      खाता नहीं है?{" "}
                      <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                        अभी रजिस्टर करें
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
              {/* --- End Form Provider --- */}
            </CardContent>
          </Card>
        </div>

        {/* Right Side Info Panel */}
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
  );
}