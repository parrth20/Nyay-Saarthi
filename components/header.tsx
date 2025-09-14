// components/header.tsx
 import Link from 'next/link'
 import { Button } from '@/components/ui/button'
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu'
 import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
 import { Menu, Scale, User, LogOut, BarChart3, MessageSquare, Phone } from 'lucide-react'
 import { createClient } from '@/utils/supabase/server'
 import { signOut } from '@/lib/actions' // <-- Corrected import path

 export async function Header() {
   const supabase = createClient()
   const { data: { user } } = await supabase.auth.getUser()
   const navLinks = [
         { href: '/dashboard', label: 'डैशबोर्ड', icon: BarChart3 },
         { href: '/chat', label: 'AI चैट', icon: MessageSquare },
         { href: '/consultation', label: 'परामर्श', icon: User },
         { href: '/support', label: 'सहायता', icon: Phone },
     ];
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
                   <Link key={link.href} href={link.href} className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-medium">
                     <link.icon className="h-4 w-4" />
                     {link.label}
                   </Link>
                 ))}

                 <div className="flex items-center gap-2">
                   {user ? (
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent">
                           <User className="h-4 w-4 mr-2" />
                           {user.email?.split('@')[0]}
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-48">
                         <DropdownMenuItem asChild>
                           <Link href="/dashboard" className="flex items-center">
                             <BarChart3 className="h-4 w-4 mr-2" />
                             डैशबोर्ड
                           </Link>
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <form action={signOut}>
                           <button type="submit" className="w-full">
                             <DropdownMenuItem className="text-red-600 focus:text-red-600 w-full cursor-pointer">
                               <LogOut className="h-4 w-4 mr-2" />
                               लॉग आउट
                             </DropdownMenuItem>
                           </button>
                         </form>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   ) : (
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
                   <SheetContent side="right">
                     <div className="flex flex-col gap-4 py-6">
                        {navLinks.map(link => (
                           <Link key={link.href} href={link.href} className="flex items-center gap-3 text-lg text-gray-700 hover:text-green-600 transition-colors font-medium">
                             <link.icon className="h-5 w-5" />
                             {link.label}
                           </Link>
                         ))}
                         <div className="border-t pt-4 mt-4 flex flex-col gap-2">
                           {user ? (
                              <form action={signOut}>
                                <Button type="submit" variant="destructive" className="w-full">
                                   <LogOut className="h-4 w-4 mr-2" />
                                   लॉग आउट
                                </Button>
                              </form>
                           ) : (
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
       )
 }