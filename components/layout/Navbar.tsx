"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Search, Menu, X } from "lucide-react"
import { useStore } from "@/lib/store"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const cartCount = useStore((state) => state.cartCount)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
                  className={`font-light text-xl sm:text-2xl tracking-wide font-display transition-colors duration-300 ${
                    isScrolled ? "text-gray-800" : "text-white drop-shadow-lg"
                  }`}
                >
                  KadamKate's Snacks
                </span>
              </Link>
            </div>

            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent ${
                    isScrolled
                      ? "border-gray-300 bg-white"
                      : "border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/80"
                  }`}
                />
              </div>
            </div>

            <nav className="hidden lg:flex items-center space-x-8">
              {["Home", "Products", "Story", "Testimonials", "Visit Us"].map((item, index) => {
                const sectionIds = ["hero", "products", "story", "testimonials", "visit"]
                return (
                  <button
                    key={item}
                    onClick={() => scrollToSection(sectionIds[index])}
                    className={`nav-link font-medium text-sm uppercase tracking-wide transition-colors font-body ${
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

            <div className="flex items-center space-x-4">
              <Link
                href="/cart"
                className={`relative p-2 rounded-full transition-colors ${
                  isScrolled ? "hover:bg-gray-100" : "hover:bg-white/20"
                }`}
              >
                <ShoppingCart className={`w-5 h-5 transition-colors ${isScrolled ? "text-gray-800" : "text-white"}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="hidden sm:flex items-center space-x-3">
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
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-full transition-colors ${
                  isScrolled ? "hover:bg-gray-100" : "hover:bg-white/20"
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

        <div
          className={`lg:hidden border-t transition-all duration-300 ${
            isScrolled ? "border-gray-200 bg-white/95" : "border-white/20 bg-white/10 backdrop-blur-sm"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="lg:hidden fixed inset-0 top-0 bg-black/50 z-30"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <div className="lg:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-40 shadow-xl transform transition-transform duration-300">
              <div className="p-6 space-y-6">
                {/* Close button */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Auth buttons */}
                <div className="border-b border-gray-200 pb-4 space-y-3">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Get Started</Button>
                  </Link>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-4">
                  {["Home", "Products", "Story", "Testimonials", "Visit Us"].map((item, index) => {
                    const sectionIds = ["hero", "products", "story", "testimonials", "visit"]
                    return (
                      <button
                        key={item}
                        onClick={() => scrollToSection(sectionIds[index])}
                        className="block w-full text-left py-3 text-gray-700 hover:text-orange-600 font-medium uppercase tracking-wide text-sm font-body"
                      >
                        {item}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  )
}
