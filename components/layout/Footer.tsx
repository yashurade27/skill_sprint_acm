
"use client"

import { MapPin, Phone, Mail, Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-orange-200 to-orange-300 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-serif text-gray-900 mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-700">Nigdi, Krushnagar, Maharashtra, Pune</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Phone className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-700">+91 8446817013</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="text-lg font-serif text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <div><a href="#featured-products" className="text-sm text-gray-700 hover:text-orange-600 transition-colors">Featured Products</a></div>
              <div><a href="#story" className="text-sm text-gray-700 hover:text-orange-600 transition-colors">Our Story</a></div>
              <div><a href="#visit" className="text-sm text-gray-700 hover:text-orange-600 transition-colors">Visit Us</a></div>
            </div>
          </div>

          {/* About */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-serif text-gray-900 mb-4">About</h3>
            <p className="text-sm text-gray-700 mb-3">
              Handcrafted traditional Indian sweets and snacks made with love by Vandana Kadam & Shubhangi Kate.
            </p>
            <div className="flex items-center justify-center md:justify-end space-x-1">
              <span className="text-sm text-gray-700">Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-sm text-gray-700">in Pune</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-orange-400/30">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-700">
              © 2025 KadamKate's Snacks. All rights reserved.
            </div>
            <div className="text-sm text-gray-700">
              Serving authentic flavors since 10+ years
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
