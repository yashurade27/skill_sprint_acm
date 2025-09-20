"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function OurStory() {
  return (
    <section
      id="story"
      className="py-16 bg-gradient-to-r from-orange-100 to-orange-200"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text content */}
          <div className="space-y-6">
            <div>
              <span className="text-sm uppercase tracking-wider text-orange-600 font-medium mb-3 block">
                LEARN ABOUT US
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4 leading-tight">
                Our Story
              </h2>
            </div>

            <div className="space-y-4 text-base text-gray-700 leading-relaxed">
              <p>
                What started as a simple passion for cooking traditional Indian
                sweets and snacks has blossomed into a thriving family business.
                For the past 10-12 years, <strong>Vandana Kadam</strong> and{" "}
                <strong>Shubhangi Kate</strong> have been lovingly crafting
                authentic flavors right from our home kitchen in Nigdi,
                Krushnagar, Maharashtra, Pune.
              </p>

              <p>
                Today, we proudly serve 100+ orders every month, bringing the
                taste of traditional Maharashtra to families across the region.
                From crispy chakli to sweet modaks, every item is handmade by
                just the two of us, ensuring that each product receives the
                personal care and attention it deserves.
              </p>

              <p>
                Our customers have become our extended family over the years.
                The love and appreciation we receive from the people of Pune
                motivates us to continue this beautiful journey.
              </p>
            </div>

            <div className="pt-3">
              <Button
                size="lg"
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                aria-label="Learn more about us"
              >
                About Us
              </Button>
            </div>
          </div>

          {/* Right side - Heritage images */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main image - Kadam Kate founders photo with portrait aspect */}
              <div className="relative w-full h-72 mx-auto rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://res.cloudinary.com/djgfbq5ql/image/upload/v1758358684/story/kadam_kate_story_1.jpg"
                  alt="Vandana Kadam and Shubhangi Kate - The founders"
                  fill
                  className="object-cover object-top rounded-2xl"
                  priority
                />

                {/* Enhanced overlay with better contrast */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3">
                  <div className="text-white">
                    <h3 className="text-sm font-bold mb-1 drop-shadow-lg">
                      Vandana Kadam &amp; Shubhangi Kate
                    </h3>
                    <p className="text-xs text-gray-100 drop-shadow-md">
                      Founders &amp; Master Chefs
                    </p>
                    <p className="text-xs text-orange-200 mt-1 drop-shadow-md">
                      Crafting authentic flavors since 10+ years
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating product elements - smaller and repositioned */}
              <div className="absolute -top-3 -left-3 w-16 h-14 bg-white rounded-lg shadow-lg p-1 z-20 border-2 border-white transform -rotate-8">
                <div className="relative w-full h-full rounded overflow-hidden">
                  <Image
                    src="https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299609/products/chakli.jpg"
                    alt="Fresh homemade chakli"
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 w-18 h-16 bg-white rounded-lg shadow-lg p-1 z-20 border-2 border-white transform rotate-3">
                <div className="relative w-full h-full rounded overflow-hidden">
                  <Image
                    src="https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299614/products/karanji.jpg"
                    alt="Traditional karanji sweets"
                    fill
                    className="object-cover"
                    sizes="72px"
                  />
                </div>
              </div>

              <div className="absolute top-1/4 -left-2 w-14 h-16 bg-white rounded-lg shadow-lg p-1 z-20 border-2 border-white transform -rotate-12">
                <div className="relative w-full h-full rounded overflow-hidden">
                  <Image
                    src="https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299617/products/ukdiche-modak.jpg"
                    alt="Authentic ukdiche modak"
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              </div>
            </div>

            {/* Enhanced background decorative elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-r from-orange-300 to-yellow-300 rounded-full opacity-20 blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full opacity-15 blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 -right-4 w-20 h-20 bg-orange-200 rounded-full opacity-30 blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
