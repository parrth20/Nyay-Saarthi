// components/header.tsx
"use client"; // Add this line because we need the usePathname hook

 import Link from 'next/link';
 import { usePathname } from 'next/navigation'; // Import usePathname
 import { Button } from '@/components/ui/button';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
 import { Menu, Scale, User, LogOut, BarChart3, MessageSquare, Phone, Upload } from 'lucide-react'; // Added Upload icon
 import { createClient } from '@/utils/supabase/client'; // Use client for hooks
 import { signOut } from '@/lib/actions'; // Keep server action for sign out
 import { useEffect, useState } from 'react'; // Import useEffect and useState for user state
 import { cn } from '@/lib/utils'; // Import cn for conditional classes

 export function Header() {
   const pathname = usePathname(); // Get the current path
   const [user, setUser] = useState<any>(null); // State to hold user data
   const [loading, setLoading] = useState(true); // State for loading user data

   // Define nav links here for easier mapping
   const navLinks = [
     { href: '/dashboard', label: 'डैशबोर्ड', icon: BarChart3 },
     { href: '/upload', label: 'अपलोड', icon: Upload }, // Added Upload link
     { href: '/chat', label: 'AI चैट', icon: MessageSquare },
     { href: '/consultation', label: 'परामर्श', icon: User }, // Assuming User icon is for consultation
     { href: '/support', label: 'सहायता', icon: Phone },
   ];

   // Fetch user on client side since this is now a client component
   useEffect(() => {
     const supabase = createClient();
     const getUser = async () => {
       setLoading(true); // Start loading
       const { data: { user: currentUser } } = await supabase.auth.getUser();
       setUser(currentUser);
       setLoading(false); // Finish loading
     };
     getUser();

     // Listen for auth changes to update UI immediately
     const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
       setUser(session?.user ?? null);
       // Optional: Add logic here if you need to react to specific events like SIGNED_IN
     });

     // Cleanup listener on component unmount
     return () => {
       authListener?.subscription.unsubscribe();
     };
   }, []);


   // Function to check if a link is active
   const isActive = (href: string) => {
     // Handle exact match for home page if needed, otherwise use startsWith
     // If you add a link for '/', use: if (href === '/') return pathname === '/';
     return pathname === href || (href !== '/' && pathname.startsWith(href));
   };

   return (
         <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-green-100">
           <div className="container mx-auto px-4 py-4">
             <div className="flex items-center justify-between">
               {/* Logo */}
               <Link href="/" className="flex items-center space-x-3">
                 <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-xl shadow-lg">
                   <Scale className="h-6 w-6 text-white" />
                 </div>
                 <div>
                   <h1 className="text-xl font-bold text-gray-900">कानूनी सहायक</h1>
                   <p className="text-xs text-green-600 font-medium">Legal Helper AI</p>
                 </div>
               </Link>

               {/* Desktop Navigation */}
               <nav className="hidden md:flex items-center gap-6">
                 {navLinks.map(link => (
                   <Link
                     key={link.href}
                     href={link.href}
                     // Apply conditional classes using cn utility
                     className={cn(
                       "flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-medium relative py-1 group", // Added group for underline animation
                       // Style for active link with animated underline
                       isActive(link.href)
                         ? "text-green-700 font-semibold" // Make active link bold
                         : ""
                     )}
                   >
                     <link.icon className="h-4 w-4" />
                     <span>{link.label}</span>
                     {/* Animated underline */}
                     <span className={cn(
                       "absolute bottom-0 left-0 h-0.5 bg-green-600 rounded-full transition-all duration-300 ease-out",
                       isActive(link.href) ? "w-full" : "w-0 group-hover:w-full" // Expand on hover or if active
                     )}></span>
                   </Link>
                 ))}

                 {/* Auth Buttons/Dropdown */}
                 <div className="flex items-center gap-2">
                   {loading ? (
                     // Skeleton placeholder while loading user state
                     <div className="h-9 w-28 bg-gray-200 rounded-md animate-pulse"></div>
                   ) : user ? (
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent">
                           <User className="h-4 w-4 mr-2" />
                           {/* Display name if available, otherwise email part */}
                           {user.user_metadata?.name || user.email?.split('@')[0]}
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-48">
                         <DropdownMenuItem asChild>
                           <Link href="/dashboard" className="flex items-center cursor-pointer">
                             <BarChart3 className="h-4 w-4 mr-2" />
                             डैशबोर्ड
                           </Link>
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         {/* Sign Out Form - Still uses Server Action */}
                         <form action={signOut} className="w-full">
                           <button type="submit" className="w-full text-left">
                             <DropdownMenuItem className="text-red-600 focus:text-red-600 w-full cursor-pointer">
                               <LogOut className="h-4 w-4 mr-2" />
                               लॉग आउट
                             </DropdownMenuItem>
                           </button>
                         </form>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   ) : (
                     // Logged out state
                     <>
                       <Link href="/login">
                         <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent">
                           लॉग इन करें
                         </Button>
                       </Link>
                       <Link href="/register">
                         <Button className="!bg-green-600 hover:!bg-green-700 text-white shadow-lg border-0">
                           अभी शुरू करें
                         </Button>
                       </Link>
                     </>
                   )}
                 </div>
               </nav>

               {/* Mobile Menu */}
               <div className="md:hidden">
                 <Sheet>
                   <SheetTrigger asChild>
                     <Button size="icon" variant="ghost">
                       <Menu className="h-6 w-6" />
                     </Button>
                   </SheetTrigger>
                   <SheetContent side="right" className="w-[280px]">
                     <div className="flex flex-col gap-4 py-6">
                        {navLinks.map(link => (
                           <Link
                             key={link.href}
                             href={link.href}
                             className={cn(
                               "flex items-center gap-3 rounded-md px-3 py-2 text-base text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors font-medium",
                               // Active state for mobile
                               isActive(link.href) ? "bg-green-100 text-green-800 font-semibold" : ""
                             )}
                           >
                             <link.icon className="h-5 w-5" />
                             {link.label}
                           </Link>
                         ))}
                         <div className="border-t pt-4 mt-4 flex flex-col gap-3">
                           {loading ? (
                             <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
                           ) : user ? (
                              <>
                                <div className="px-3 py-2 text-sm text-gray-500">
                                   Signed in as {user.user_metadata?.name || user.email}
                                </div>
                                {/* Sign Out Form for Mobile */}
                                <form action={signOut} className="w-full">
                                  <Button type="submit" variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700">
                                     <LogOut className="h-4 w-4 mr-2" />
                                     लॉग आउट
                                  </Button>
                                </form>
                              </>
                           ) : (
                             // Logged out state for Mobile
                             <>
                               <Link href="/login" className="w-full">
                                 <Button variant="outline" className="w-full border-green-600 text-green-600">लॉग इन करें</Button>
                               </Link>
                               <Link href="/register" className="w-full">
                                 <Button className="w-full !bg-green-600 hover:!bg-green-700 text-white">अभी शुरू करें</Button>
                               </Link>
                             </>
                           )}
                         </div>
                     </div>
                   </SheetContent>
                 </Sheet>
               </div>
             </div>
           </div>
         </header>
       );
 }