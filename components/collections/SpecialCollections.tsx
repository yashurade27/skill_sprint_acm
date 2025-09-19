"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function SpecialCollections() {
  const collections = [
    {
      id: "diwali-sweets",
      title: "Diwali Special Sweets",
      items: ["Anarsa (अनारसा)", "Chirote (चिरोटे)", "Tilgul Ladu (तिळगुळ लाडू)", "Sweet Karanji"],
      image: "/diwali-special-sweets-anarsa-chirote-tilgul-laddu.jpg",
      bgColor: "from-yellow-400 to-orange-500",
    },
    {
      id: "fasting-foods",
      title: "Fasting Special (Vrat/Upvas)",
      items: [
        "Sabudana Khichdi (साबुदाणा खिचडी)",
        "Sabudana Vada (साबुदाणा वडा)",
        "Farali Thalipeeth (फराळी थालीपीठ)",
        "Rajgira Laddu",
      ],
      image: "/fasting-food-sabudana-khichdi-vada-farali-thalipee.jpg",
      bgColor: "from-green-400 to-teal-500",
    },
    {
      id: "savory-snacks",
      title: "Traditional Savory Snacks",
      items: ["Kurdai (कुर्डई)", "Udid Papad (उडदाचे पापड)", "Spicy Sev (शेव)", "Corn Flakes Chivda"],
      image: "/traditional-savory-snacks-kurdai-papad-sev-chivda.jpg",
      bgColor: "from-red-400 to-pink-500",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Special Collections</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Curated selections for every occasion and tradition</p>
        </div>

        {/* Collections grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <Card
              key={collection.id}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 h-96"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${collection.bgColor}`}>
                <Image
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.title}
                  fill
                  className="object-cover opacity-70 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300"></div>
              </div>

              <CardContent className="relative z-10 h-full flex flex-col justify-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-4">{collection.title}</h3>
                  <ul className="space-y-2 mb-6">
                    {collection.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-white/90 text-sm">
                        • {item}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-800 font-semibold px-6 py-2 rounded-full transition-all duration-300 group-hover:scale-105 bg-transparent"
                  >
                    Explore Collection
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}