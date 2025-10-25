// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Users, FileText, Loader2, User as UserIcon, Phone } from "lucide-react"; // Added UserIcon, Phone
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { singUp as signUp } from "@/actions/auth"; // Import the server action
import { toast } from "sonner"; // For showing success/error messages

// --- Zod Schema for Registration Validation ---
const registerSchema = z.object({
  name: z.string().min(1, { message: "कृपया पूरा नाम दर्ज करें।" }),
  email: z.string().email({ message: "कृपया वैध ईमेल पता दर्ज करें।" }),
  phone: z.string().min(10, { message: "कृपया वैध 10 अंकों का फ़ोन नंबर दर्ज करें।" }).max(15, { message: "फ़ोन नंबर बहुत लंबा है।"}), // Basic phone validation
  password: z.string().min(6, { message: "पासवर्ड कम से कम 6 अक्षर का होना चाहिए।" }),
  confirmPassword: z.string().min(1, { message: "कृपया पासवर्ड की पुष्टि करें।" }),
  terms: z.boolean().refine(val => val === true, {
    message: "आपको नियमों और शर्तों से सहमत होना होगा।",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "पासवर्ड मेल नहीं खाते।",
  path: ["confirmPassword"], // Apply error to confirmPassword field
});

type RegisterFormValues = z.infer<typeof registerSchema>;
// --- End Schema ---

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  // --- React Hook Form Setup ---
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    mode: "onChange",
  });
  // --- End Setup ---

  // --- Registration Handler ---
  const handleRegister = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setServerError("");
    console.log("Register button clicked"); // Debug log

    // Create FormData for the server action
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("password", values.password);

    console.log("Calling signUp server action..."); // Debug log
    try {
        const result = await signUp(formData); // Call the server action
        console.log("Result from signUp:", result); // Debug log

        if (result?.status === 'error') {
            setServerError(result.message || "पंजीकरण विफल। कृपया पुनः प्रयास करें।");
            toast.error("Registration Failed", { description: result.message });
        } else if (result?.status === 'pending') {
            // This status indicates user exists but needs verification - show appropriate message
             setServerError(result.message || "यह ईमेल पहले से मौजूद है। कृपया सत्यापित करें या लॉगिन करें।");
             toast.info("Account Exists", { description: "This email already exists. Please verify or log in." });
             // Optionally redirect to login or verification pending page
             // router.push('/login');
        } else if (result?.status === 'success') {
            toast.success("Registration Successful!", { description: "Please check your email to verify your account." });
            router.push("/Verify"); // Redirect to verification notice page
        } else {
             // Handle unexpected result format
             setServerError("An unexpected error occurred during registration.");
             toast.error("Registration Failed", { description: "Unexpected response from server." });
        }
    } catch (err: any) {
        console.error("Error calling signUp action:", err);
        setServerError("पंजीकरण के दौरान एक त्रुटि हुई।");
        toast.error("Registration Failed", { description: err.message || "An unknown error occurred." });
    } finally {
        setIsLoading(false);
    }
  };
  // --- End Handler ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side Info Panel (similar to login) */}
        <div className="hidden lg:block">
           <div className="text-center mb-8">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">न्याय-सारथी से जुड़ें</h2>
             <p className="text-lg text-gray-600">अपना खाता बनाएं और कानूनी दस्तावेज़ों को समझना शुरू करें।</p>
           </div>
           <div className="space-y-6">
             {/* Info points */}
             <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-lg"> <FileText className="h-6 w-6 text-green-600 mt-1"/> <div> <h3 className="font-semibold text-gray-900 mb-1">सरल विश्लेषण</h3> <p className="text-gray-600 text-sm">जटिल दस्तावेजों को आसानी से समझें।</p> </div> </div>
             <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-lg"> <Shield className="h-6 w-6 text-blue-600 mt-1"/> <div> <h3 className="font-semibold text-gray-900 mb-1">सुरक्षित और निजी</h3> <p className="text-gray-600 text-sm">आपका डेटा सुरक्षित रखा जाता है।</p> </div> </div>
             <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-lg"> <Users className="h-6 w-6 text-purple-600 mt-1"/> <div> <h3 className="font-semibold text-gray-900 mb-1">विशेषज्ञ सहायता</h3> <p className="text-gray-600 text-sm">AI से पूछें या विशेषज्ञों से जुड़ें।</p> </div> </div>
           </div>
         </div>

         {/* Right Side Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="h-8 w-8 text-white" /> {/* Use UserIcon */}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">नया खाता बनाएं</CardTitle>
              <p className="text-gray-600 mt-1 text-sm">शुरू करने के लिए अपनी जानकारी दर्ज करें।</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4"> {/* Reduced space */}
                  {serverError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center">
                      <p className="text-red-700 text-sm">{serverError}</p>
                    </div>
                  )}

                   {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor={field.name}>पूरा नाम</FormLabel>
                        <div className="relative">
                           <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                          <FormControl>
                            <Input id={field.name} placeholder="आपका पूरा नाम" className="pl-10" disabled={isLoading} {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor={field.name}>ईमेल पता</FormLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                          <FormControl>
                            <Input id={field.name} type="email" placeholder="आपका ईमेल" className="pl-10" disabled={isLoading} {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                   {/* Phone Field */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor={field.name}>फ़ोन नंबर</FormLabel>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                          <FormControl>
                            <Input id={field.name} type="tel" placeholder="आपका फ़ोन नंबर" className="pl-10" disabled={isLoading} {...field} />
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
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                          <FormControl>
                            <Input id={field.name} type={showPassword ? "text" : "password"} placeholder="पासवर्ड बनाएं" className="pl-10 pr-10" disabled={isLoading} {...field} />
                          </FormControl>
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 p-1" disabled={isLoading} tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                   {/* Confirm Password Field */}
                   <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor={field.name}>पासवर्ड की पुष्टि करें</FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                          <FormControl>
                            <Input id={field.name} type={showConfirmPassword ? "text" : "password"} placeholder="पासवर्ड दोबारा दर्ज करें" className="pl-10 pr-10" disabled={isLoading} {...field} />
                          </FormControl>
                           <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 p-1" disabled={isLoading} tabIndex={-1} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>
                             {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                           </button>
                        </div>
                        <FormMessage /> {/* Error specifically for mismatch will appear here */}
                      </FormItem>
                    )}
                  />

                   {/* Terms and Conditions */}
                  <FormField
                    control={form.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-gray-50/50">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                            id={field.name}
                            aria-describedby="terms-description" // Link to description
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel htmlFor={field.name} className="cursor-pointer">नियम और शर्तों से सहमत हैं</FormLabel>
                           <p id="terms-description" className="text-xs text-muted-foreground">
                             जारी रखने के लिए आपको हमारी सेवा की शर्तों और गोपनीयता नीति से सहमत होना होगा।
                           </p>
                           <FormMessage /> {/* Error if not checked */}
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white disabled:opacity-70" disabled={isLoading || !form.formState.isValid}>
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> पंजीकरण हो रहा है...</>
                    ) : (
                      <> खाता बनाएं <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>

                  {/* Link to Login */}
                  <div className="text-center pt-1">
                    <p className="text-sm text-gray-600">
                      पहले से खाता है?{" "}
                      <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                        यहां लॉगिन करें
                      </Link>
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}