"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Navigation, Heart, Award } from "lucide-react"

export default function VisitUs() {
  return (
    <section id="visit" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content - single column without right image */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">Visit Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience authentic homemade Indian sweets and snacks crafted with love in Pune
            </p>
          </div>

          <div className="space-y-8">
            {/* Address and contact */}
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Our Home Kitchen</h3>
                <div className="flex items-start justify-center space-x-3 text-lg text-gray-600">
                  <MapPin className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <p>Krushnagar, Nigdi, Maharashtra, Pune</p>
                  </div>
                </div>
              </div>

              {/* Phone number */}
              <div className="flex items-center justify-center space-x-3 text-lg text-gray-600">
                <Phone className="w-6 h-6 text-orange-500 flex-shrink-0" />
                <p>+91 8446817013</p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <a
                  href="https://maps.app.goo.gl/MfHKDzrUR484GQt89"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Google Maps
                  </Button>
                </a>
                <a href="tel:+918446817013">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 bg-transparent"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </a>
              </div>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">Made with Love</h4>
                  <p className="text-sm text-gray-600">Handcrafted by Vandana & Shubhangi Kate</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-6 text-center">
                  <Award className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">100+ Orders</h4>
                  <p className="text-sm text-gray-600">Monthly satisfied customers</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">Home Kitchen</h4>
                  <p className="text-sm text-gray-600">Authentic homemade quality</p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-6 text-center">
                  <Phone className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">Made to Order</h4>
                  <p className="text-sm text-gray-600">Fresh on every order</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
