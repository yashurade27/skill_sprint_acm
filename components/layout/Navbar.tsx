"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import { signOut } from "next-auth/react";
import { ShoppingCart, Search, User, LogOut, Menu, X } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function Navbar() {
  const { user, isLoading, isAuthenticated, isAdmin } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400&family=Poppins:wght@300;700&display=swap" rel="stylesheet" />
      </Head>
      
      <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-orange-300 to-orange-400 shadow-lg">
        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <span 
                  className="text-gray-800 font-light text-xl sm:text-2xl tracking-wide"
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 300,
                  }}
                >
                  KadamKate's Snacks
                </span>
              </Link>
            </div>

            {/* Desktop Search - Hidden on mobile */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection("hero")}
                className="nav-link text-gray-800 hover:text-gray-600 font-medium text-sm uppercase tracking-wide transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("products")}
                className="nav-link text-gray-800 hover:text-gray-600 font-medium text-sm uppercase tracking-wide transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Products
              </button>
              <button
                onClick={() => scrollToSection("story")}
                className="nav-link text-gray-800 hover:text-gray-600 font-medium text-sm uppercase tracking-wide transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Story
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="nav-link text-gray-800 hover:text-gray-600 font-medium text-sm uppercase tracking-wide transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Testimonials
              </button>
              <button
                onClick={() => scrollToSection("visit")}
                className="nav-link text-gray-800 hover:text-gray-600 font-medium text-sm uppercase tracking-wide transition-colors"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Visit Us
              </button>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              
              {/* Cart Icon */}
              <Link href="/cart" className="relative p-2 rounded-full hover:bg-white/20 transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-800" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  0
                </span>
              </Link>

              {/* Authentication - Desktop */}
              {isLoading ? (
                <div className="w-8 h-8 bg-white/30 rounded-full animate-pulse"></div>
              ) : isAuthenticated ? (
                <div className="hidden sm:block relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/20 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-orange-500" />
                    </div>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Profile
                    </Link>
                    <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-800 hover:bg-white/20 border-none"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button 
                      size="sm"
                      className="bg-white text-orange-600 hover:bg-gray-100 font-medium px-4 py-2 rounded-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-800" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-800" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden border-t border-orange-200/50 bg-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-white"
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
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* User Section */}
                {isAuthenticated ? (
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm truncate max-w-[200px]">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Link 
                        href="/profile" 
                        className="block py-2 text-gray-700 hover:text-orange-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link 
                        href="/orders" 
                        className="block py-2 text-gray-700 hover:text-orange-600"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      {isAdmin && (
                        <Link 
                          href="/admin" 
                          className="block py-2 text-gray-700 hover:text-orange-600"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 py-2 text-red-600 hover:text-red-700"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-b border-gray-200 pb-4 space-y-3">
                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="space-y-4">
                  <button
                    onClick={() => scrollToSection("hero")}
                    className="block w-full text-left py-3 text-gray-700 hover:text-orange-600 font-medium uppercase tracking-wide text-sm"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => scrollToSection("products")}
                    className="block w-full text-left py-3 text-gray-700 hover:text-orange-600 font-medium uppercase tracking-wide text-sm"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Products
                  </button>
                  <button
                    onClick={() => scrollToSection("story")}
                    className="block w-full text-left py-3 text-gray-700 hover:text-orange-600 font-medium uppercase tracking-wide text-sm"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Story
                  </button>
                  <button
                    onClick={() => scrollToSection("testimonials")}
                    className="block w-full text-left py-3 text-gray-700 hover:text-orange-600 font-medium uppercase tracking-wide text-sm"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Testimonials
                  </button>
                  <button
                    onClick={() => scrollToSection("visit")}
                    className="block w-full text-left py-3 text-gray-700 hover:text-orange-600 font-medium uppercase tracking-wide text-sm"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Visit Us
                  </button>
                </nav>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}

