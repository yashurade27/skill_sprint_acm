"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function OurStory() {
  return (
    <section id="story" className="py-16 bg-gradient-to-r from-orange-100 to-orange-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-6">
            <div>
              <span className="text-sm uppercase tracking-wider text-orange-600 font-medium mb-3 block">
                LEARN ABOUT US
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4 leading-tight">Our Story</h2>
            </div>

            <div className="space-y-4 text-base text-gray-700 leading-relaxed">
              <p>
                What started as a simple passion for cooking traditional Indian sweets and snacks has blossomed into 
                a thriving family business. For the past 10-12 years, <strong>Vandana Kadam</strong> and <strong>A Kate</strong> have been lovingly crafting authentic 
                flavors right from our home kitchen in Nigdi, Krushnagar, Maharashtra, Pune.
              </p>

              <p>
                Today, we proudly serve 100+ orders every month, bringing the taste of traditional Maharashtra to 
                families across the region. From crispy chakli to sweet modaks, every item is handmade by just the 
                two of us, ensuring that each product receives the personal care and attention it deserves.
              </p>

              <p>
                Our customers have become our extended family over the years. The love and appreciation we receive 
                from the people of Pune motivates us to continue this beautiful journey.
              </p>
            </div>

            <div className="pt-3">
              <Button
                size="lg"
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105"
              >
                About Us
              </Button>
            </div>
          </div>

          {/* Right side - Heritage images */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main image - placeholder for owners' photo */}
              <div className="relative w-full h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/placeholder.svg"
                  alt="Vandana Kadam and A Kate - The founders"
                  fill
                  className="object-cover"
                />
                {/* Overlay with names */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <div className="text-white">
                    <h3 className="text-xl font-semibold mb-1">Vandana Kadam & A Kate</h3>
                    <p className="text-sm text-gray-200">Founders & Master Chefs</p>
                  </div>
                </div>
              </div>

              {/* Floating product elements - smaller */}
              <div className="absolute -top-4 -left-4 w-24 h-20 bg-white rounded-lg shadow-lg p-1 rotate-[-5deg] z-20">
                <Image
                  src="https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299609/products/chakli.jpg"
                  alt="Fresh homemade chakli"
                  fill
                  className="object-cover rounded"
                />
              </div>

              <div className="absolute -bottom-6 -right-6 w-28 h-24 bg-white rounded-lg shadow-lg p-1 rotate-[3deg] z-20">
                <Image
                  src="https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299614/products/karanji.jpg"
                  alt="Traditional karanji sweets"
                  fill
                  className="object-cover rounded"
                />
              </div>

              <div className="absolute top-1/3 -left-3 w-20 h-24 bg-white rounded-lg shadow-lg p-1 rotate-[-8deg] z-20">
                <Image
                  src="https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299617/products/ukdiche-modak.jpg"
                  alt="Authentic ukdiche modak"
                  fill
                  className="object-cover rounded"
                />
              </div>
            </div>

            {/* Background decorative elements - smaller */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-300 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-yellow-300 rounded-full opacity-20 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
