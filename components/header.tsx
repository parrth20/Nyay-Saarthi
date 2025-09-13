"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Scale, MessageSquare, BarChart3, Phone, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCurrentUser, logout, type User as UserType } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const checkUser = () => {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    }

    checkUser()

    // Listen for storage changes to update auth state
    const handleStorageChange = () => {
      checkUser()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
    router.push("/")
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100" : "bg-transparent"
      }`}
    >
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
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              <BarChart3 className="h-4 w-4" />
              डैशबोर्ड
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              <MessageSquare className="h-4 w-4" />
              AI चैट
            </Link>
            <Link href="/consultation" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              परामर्श
            </Link>
            <Link
              href="/support"
              className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              <Phone className="h-4 w-4" />
              सहायता
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      डैशबोर्ड
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      प्रोफाइल
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    लॉग आउट
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                  >
                    लॉग इन करें
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="!bg-green-600 hover:!bg-green-700 text-white shadow-lg border-0">अभी शुरू करें</Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-medium py-2"
              >
                <BarChart3 className="h-4 w-4" />
                डैशबोर्ड
              </Link>
              <Link
                href="/chat"
                className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-medium py-2"
              >
                <MessageSquare className="h-4 w-4" />
                AI चैट
              </Link>
              <Link
                href="/consultation"
                className="text-gray-700 hover:text-green-600 transition-colors font-medium py-2"
              >
                परामर्श
              </Link>
              <Link
                href="/support"
                className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors font-medium py-2"
              >
                <Phone className="h-4 w-4" />
                सहायता
              </Link>

              <div className="flex flex-col space-y-2 pt-4">
                {user ? (
                  <>
                    <div className="text-sm text-gray-600 py-2 border-b border-gray-200">स्वागत, {user.name}</div>
                    <Link href="/profile">
                      <Button
                        variant="outline"
                        className="w-full border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                      >
                        <User className="h-4 w-4 mr-2" />
                        प्रोफाइल
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      लॉग आउट
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="w-full border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                      >
                        लॉग इन करें
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full !bg-green-600 hover:!bg-green-700 text-white border-0">
                        अभी शुरू करें
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
