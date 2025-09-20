"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, X, User, LogOut, ShoppingBasket } from "lucide-react"
import { useStore } from "@/lib/store"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { data: session, status } = useSession()
  const cartCount = useStore((state) => state.cartCount)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    document.addEventListener("click", handleClickOutside)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("click", handleClickOutside)
    }
  }, [showUserMenu])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
      >
        {!isScrolled && (
          <div className="bg-orange-200/90 backdrop-blur-sm text-center py-2 text-sm text-orange-800">
            Welcome to our authentic Indian snacks! FREE shipping on orders above ₹1000.
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? "h-16" : "h-20"}`}
          >
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <span
                  className={`font-serif text-xl sm:text-2xl tracking-wide transition-colors duration-300 ${
                    isScrolled ? "text-gray-800" : "text-white drop-shadow-lg"
                  }`}
                >
                  KadamKate's Snacks
                </span>
              </Link>
            </div>

            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              <Link href="/" className={`nav-link font-medium text-sm uppercase tracking-wide transition-colors ${
                isScrolled
                  ? "text-gray-800 hover:text-orange-600"
                  : "text-white hover:text-orange-200 drop-shadow-sm"
              }`}>
                Home
              </Link>
              <Link href="/products" className={`nav-link font-medium text-sm uppercase tracking-wide transition-colors ${
                isScrolled
                  ? "text-gray-800 hover:text-orange-600"
                  : "text-white hover:text-orange-200 drop-shadow-sm"
              }`}>
                Products
              </Link>
              {["Story", "Testimonials", "Visit Us"].map((item, index) => {
                const sectionIds = ["story", "testimonials", "visit"]
                return (
                  <button
                    key={item}
                    onClick={() => scrollToSection(sectionIds[index])}
                    className={`nav-link font-medium text-sm uppercase tracking-wide transition-colors ${
                      isScrolled
                        ? "text-gray-800 hover:text-orange-600"
                        : "text-white hover:text-orange-200 drop-shadow-sm"
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </nav>

            <div className="flex items-center space-x-4 ml-4">
              {/* Orders Button - Only show for logged in users */}
              {session?.user && (
                <Link
                  href="/orders"
                  className={`p-2 rounded-full transition-colors ${
                    isScrolled ? "hover:bg-gray-100" : "hover:bg-white/20"
                  }`}
                  title="My Orders"
                >
                  <ShoppingBasket className={`w-5 h-5 transition-colors ${isScrolled ? "text-gray-800" : "text-white"}`} />
                </Link>
              )}

              {/* Cart Button */}
              <Link
                href="/checkout"
                className={`relative p-2 rounded-full transition-colors ${
                  isScrolled ? "hover:bg-gray-100" : "hover:bg-white/20"
                }`}
                title="Shopping Cart"
              >
                <ShoppingCart className={`w-5 h-5  transition-colors ${isScrolled ? "text-gray-800" : "text-white"}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="hidden sm:flex items-center space-x-3">
                {session?.user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className={`flex items-center space-x-2 p-2 rounded-full transition-colors ${
                        isScrolled ? "hover:bg-gray-100" : "hover:bg-white/20"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isScrolled ? "bg-orange-500" : "bg-white"
                      }`}>
                        <User className={`w-4 h-4 ${isScrolled ? "text-white" : "text-orange-500"}`} />
                      </div>
                      <span className={`font-medium ${isScrolled ? "text-gray-800" : "text-white"}`}>
                        {session.user.email?.split('@')[0] || 'User'}
                      </span>
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="py-2">
                          <div className="px-4 py-2 text-sm text-gray-700 border-b">
                            {session.user.email}
                          </div>
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`transition-colors border-none ${
                          isScrolled ? "text-gray-800 hover:bg-gray-100" : "text-white hover:bg-white/20"
                        }`}
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button
                        size="sm"
                        className={`font-medium px-5 py-2 rounded-full transition-all duration-300 ${
                          isScrolled
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-white text-orange-600 hover:bg-gray-100"
                        }`}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-full transition-colors ${
                  isScrolled ? "hover:bg-gray-100 bg-gray-50" : "hover:bg-white/20"
                }`}
              >
                {isMobileMenuOpen ? (
                  <X className={`w-6 h-6 ${isScrolled ? "text-gray-800" : "text-white"}`} />
                ) : (
                  <Menu className={`w-6 h-6 ${isScrolled ? "text-gray-800" : "text-white"}`} />
                )}
              </button>
            </div>
          </div>
        </div>



        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-[100]"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <div className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-[110] shadow-2xl transform transition-transform duration-300">
              <div className="p-6 space-y-6 bg-white h-full overflow-y-auto">
                {/* Close button */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                  <span className="text-xl font-serif text-gray-800">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Auth buttons */}
                <div className="space-y-3">
                  {session?.user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{session.user.email?.split('@')[0] || 'User'}</p>
                          <p className="text-sm text-gray-600">{session.user.email}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          signOut({ callbackUrl: '/' })
                          setIsMobileMenuOpen(false)
                        }}
                        variant="outline" 
                        className="w-full bg-white border-gray-300 text-gray-800 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full bg-white border-gray-300 text-gray-800 hover:bg-gray-50">
                          Login
                        </Button>
                      </Link>
                      <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Get Started</Button>
                      </Link>
                    </>
                  )}
                </div>

                {/* Navigation Links */}
                <div className="border-t border-gray-200 pt-4">
                  <nav className="space-y-2">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="block w-full text-left py-4 px-4 text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium uppercase tracking-wide text-sm rounded-lg transition-colors">
                        Home
                      </div>
                    </Link>
                    <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="block w-full text-left py-4 px-4 text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium uppercase tracking-wide text-sm rounded-lg transition-colors">
                        Products
                      </div>
                    </Link>
                    {session?.user && (
                      <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="block w-full text-left py-4 px-4 text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium uppercase tracking-wide text-sm rounded-lg transition-colors">
                          Orders
                        </div>
                      </Link>
                    )}
                    {["Story", "Testimonials", "Visit Us"].map((item, index) => {
                      const sectionIds = ["story", "testimonials", "visit"]
                      return (
                        <button
                          key={item}
                          onClick={() => scrollToSection(sectionIds[index])}
                          className="block w-full text-left py-4 px-4 text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium uppercase tracking-wide text-sm rounded-lg transition-colors"
                        >
                          {item}
                        </button>
                      )
                    })}
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  )
}
