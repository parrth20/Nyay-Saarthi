// components/header.tsx
"use client";

 import Link from 'next/link';
 import { usePathname } from 'next/navigation';
 import { Button, buttonVariants } from '@/components/ui/button'; // Import buttonVariants
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Menu, Scale, User, LogOut, BarChart3, MessageSquare, Phone, Upload, Loader2, Settings } from 'lucide-react';
 import { createClient } from '@/utils/supabase/client';
 import { signOut } from '@/lib/actions'; // Make sure this path points to your file with "use server"
 import { useEffect, useState } from 'react';
 import { cn } from '@/lib/utils';
 import { toast } from 'sonner';
import { GitCompareArrows } from 'lucide-react'; // Make sure GitCompareArrows is imported
 // Helper to get initials
 
 const getInitials = (name?: string, email?: string): string => {
    if (name) {
        const nameParts = name.split(' ').filter(Boolean);
        if (nameParts.length > 1) {
            return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
        } else if (nameParts.length === 1 && nameParts[0].length > 0) {
            return nameParts[0][0].toUpperCase();
        }
    }
    if (email) {
        return email[0].toUpperCase();
    }
    return '?'; // Default fallback
 };


 export function Header() {
   const pathname = usePathname();
   const [user, setUser] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

const navLinks = [
  { href: '/dashboard', label: 'डैशबोर्ड', icon: BarChart3 },
  { href: '/upload', label: 'अपलोड', icon: Upload },
  { href: '/compare', label: 'तुलना करें', icon: GitCompareArrows }, 
  { href: '/chat', label: 'AI चैट', icon: MessageSquare },
  { href: '/consultation', label: 'परामर्श', icon: User },
  { href: '/support', label: 'सहायता', icon: Phone },
];

   useEffect(() => {
     const supabase = createClient();
     const getUser = async () => {
       setLoading(true);
       const { data: { user: currentUser } } = await supabase.auth.getUser();
       setUser(currentUser);
       setLoading(false);
     };
     getUser();

     const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
       setUser(session?.user ?? null);
     });

     // Cleanup listener on component unmount
     return () => {
       authListener?.subscription.unsubscribe();
     };
   }, []);


   const isActive = (href: string) => {
     // Handle exact match for home page if needed, otherwise use startsWith
     return pathname === href || (href !== '/' && pathname.startsWith(href));
   };

   // Function to handle logout directly
   const handleLogoutDirect = async () => {
     setIsLoggingOut(true);
     try {
       await signOut();
       // Redirect is handled by the server action
     } catch (error) {
       console.error("Logout failed:", error);
       toast.error("Logout failed. Please try again.");
       setIsLoggingOut(false); // Reset loading state ONLY on error
     }
     // No need to set isLoggingOut to false on success, as redirect happens
   };

   // Close mobile menu on navigation change
   useEffect(() => {
     setIsMobileMenuOpen(false);
   }, [pathname]);


   // --- Get User Display Info ---
   const userName = user?.user_metadata?.name || user?.user_metadata?.full_name;
   const userEmail = user?.email;
   const avatarUrl = user?.user_metadata?.avatar_url;
   const userInitials = getInitials(userName, userEmail);
   const displayName = userName || userEmail?.split('@')[0] || 'Account';
   // ---

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
                     className={cn(
                       "flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-medium relative py-1 group",
                       isActive(link.href) ? "text-green-700 font-semibold" : ""
                     )}
                   >
                     <link.icon className="h-4 w-4" />
                     <span>{link.label}</span>
                     {/* Animated underline */}
                     <span className={cn(
                       "absolute bottom-0 left-0 h-0.5 bg-green-600 rounded-full transition-all duration-300 ease-out",
                       isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                     )}></span>
                   </Link>
                 ))}

                 {/* Auth Buttons/Dropdown */}
                 <div className="flex items-center gap-2">
                   {loading ? (
                     <div className="h-9 w-28 bg-gray-200 rounded-md animate-pulse"></div>
                   ) : user ? (
                     <DropdownMenu onOpenChange={(open) => console.log('Dropdown open state changed:', open)}>
                       {/* Trigger IS the button, styles applied directly */}
                       <DropdownMenuTrigger
                         className={cn(
                             buttonVariants({ variant: "outline" }), // Base button styles
                             "border-green-600 text-green-600 hover:bg-green-50 bg-transparent", // Specific overrides
                             "disabled:opacity-50 flex items-center gap-2 px-3 h-9 py-2" // Layout & Disabled styles
                         )}
                         disabled={loading || isLoggingOut}
                       >
                         {/* Button Content Wrapped in Span */}
                         <span className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                               <AvatarImage src={avatarUrl} alt={displayName} />
                               <AvatarFallback className="text-xs bg-green-100 text-green-700">
                                 {userInitials}
                               </AvatarFallback>
                             </Avatar>
                            <span className="truncate max-w-[100px]">{displayName}</span>
                         </span>
                       </DropdownMenuTrigger>

                       {/* Dropdown Content */}
                       <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel className="font-normal">
                             <div className="flex flex-col space-y-1">
                               <p className="text-sm font-medium leading-none truncate">{userName || 'User'}</p>
                               <p className="text-xs leading-none text-muted-foreground truncate">
                                 {userEmail}
                               </p>
                             </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard" className="flex items-center cursor-pointer">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              डैशबोर्ड
                            </Link>
                          </DropdownMenuItem>
                          {/* Enabled Account Settings Link */}
                          <DropdownMenuItem asChild>
                            <Link href="/account-settings" className="flex items-center cursor-pointer">
                              <Settings className="h-4 w-4 mr-2" />
                              Account Settings
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {/* Logout Item */}
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 w-full cursor-pointer focus:bg-red-50 disabled:opacity-50"
                            onSelect={(e) => {
                              e.preventDefault();
                              handleLogoutDirect();
                            }}
                            disabled={isLoggingOut}
                          >
                            {isLoggingOut ? ( <Loader2 className="h-4 w-4 mr-2 animate-spin" /> ) : ( <LogOut className="h-4 w-4 mr-2" /> )}
                            {isLoggingOut ? "Logging out..." : "लॉग आउट"}
                          </DropdownMenuItem>
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
                 <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                   <SheetTrigger asChild>
                     <Button size="icon" variant="ghost" disabled={loading}>
                       <Menu className="h-6 w-6" />
                     </Button>
                   </SheetTrigger>
                   <SheetContent side="right" className="w-[280px] flex flex-col p-0">
                     {/* Header inside Sheet */}
                     <div className="p-4 border-b">
                       <Link href="/" className="flex items-center space-x-3" onClick={() => setIsMobileMenuOpen(false)}>
                         <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-xl shadow-lg">
                           <Scale className="h-6 w-6 text-white" />
                         </div>
                         <div>
                            <h1 className="text-lg font-bold text-gray-900">कानूनी सहायक</h1>
                            <p className="text-xs text-green-600 font-medium">Legal Helper AI</p>
                         </div>
                       </Link>
                     </div>

                      {/* Scrollable Nav Area */}
                      <div className="flex-grow overflow-y-auto p-4 space-y-3">
                          {navLinks.map(link => (
                             <Link
                               key={link.href}
                               href={link.href}
                               className={cn(
                                 "flex items-center gap-3 rounded-md px-3 py-2 text-base text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors font-medium",
                                 isActive(link.href) ? "bg-green-100 text-green-800 font-semibold" : ""
                               )}
                               onClick={() => setIsMobileMenuOpen(false)} // Close on click
                             >
                               <link.icon className="h-5 w-5" />
                               {link.label}
                             </Link>
                           ))}
                      </div>

                       {/* Sticky Auth Area at Bottom */}
                       <div className="border-t p-4 flex flex-col gap-3 mt-auto bg-white">
                         {loading ? (
                           <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
                         ) : user ? (
                            <>
                              {/* Mobile User Info */}
                              <div className="flex items-center gap-3 px-1 py-2 border-b mb-2 pb-3">
                                 <Avatar className="h-9 w-9">
                                    <AvatarImage src={avatarUrl} alt={displayName} />
                                    <AvatarFallback className="text-sm bg-green-100 text-green-700">
                                      {userInitials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col overflow-hidden">
                                      <span className="text-sm font-medium truncate">{userName || 'User'}</span>
                                      <span className="text-xs text-gray-500 truncate">{userEmail}</span>
                                  </div>
                              </div>
                              {/* Enabled Mobile Account Settings Button */}
                              <Link href="/account-settings" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Account Settings
                                </Button>
                              </Link>
                              {/* Mobile Logout Form */}
                              <form action={signOut} className="w-full">
                                <Button type="submit" variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700" disabled={isLoggingOut}>
                                  {isLoggingOut ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                      <LogOut className="h-4 w-4 mr-2" />
                                  )}
                                   {isLoggingOut ? "Logging out..." : "लॉग आउट"}
                                </Button>
                              </form>
                            </>
                         ) : (
                           // Logged out state for Mobile
                           <>
                             <Link href="/login" className="w-full">
                               <Button variant="outline" className="w-full border-green-600 text-green-600" onClick={() => setIsMobileMenuOpen(false)}>लॉग इन करें</Button>
                             </Link>
                             <Link href="/register" className="w-full">
                               <Button className="w-full !bg-green-600 hover:!bg-green-700 text-white" onClick={() => setIsMobileMenuOpen(false)}>अभी शुरू करें</Button>
                             </Link>
                           </>
                         )}
                       </div>
                   </SheetContent>
                 </Sheet>
               </div>
               {/* --- END Mobile Menu --- */}

             </div>
           </div>
         </header>
       );
 }