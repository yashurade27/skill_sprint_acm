"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Festival {
  id: number
  name: string
  description: string
  image: string
  bgGradient: string
  textColor: string
  buttonStyle: string
}

const festivals: Festival[] = [
  {
    id: 1,
    name: "Navratri",
    description: "Dance to the divine rhythms. Celebrate with traditional sweets and festive treats.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    bgGradient: "bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800",
    textColor: "text-white",
    buttonStyle: "bg-white text-purple-700 hover:bg-purple-50"
  },
  {
    id: 2,
    name: "Holi",
    description: "Colors of joy and happiness. Celebrate with gulal and festive delicacies.",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    bgGradient: "bg-gradient-to-br from-pink-500 via-red-500 to-orange-500",
    textColor: "text-white",
    buttonStyle: "bg-white text-pink-700 hover:bg-pink-50"
  },
  {
    id: 3,
    name: "Dussehra",
    description: "Victory of good over evil. Celebrate with traditional sweets and savory treats.",
    image: "https://images.unsplash.com/photo-1604608672516-8e2c8161c867?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    bgGradient: "bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800",
    textColor: "text-white",
    buttonStyle: "bg-white text-emerald-700 hover:bg-emerald-50"
  }
]

export default function FestivalSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % festivals.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + festivals.length) % festivals.length)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % festivals.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  const currentFestival = festivals[currentIndex]

  const scrollToProducts = () => {
    window.location.href = '/products'
  }

  return (
    <section className="relative h-[70vh] overflow-hidden">
      {/* Background with gradient */}
      <div className={`absolute inset-0 ${currentFestival.bgGradient} transition-all duration-1000 ease-in-out`}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-16 left-8 w-24 h-24 bg-white rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-32 right-16 w-16 h-16 bg-yellow-300 rounded-full blur-lg animate-pulse delay-300"></div>
          <div className="absolute bottom-20 left-1/3 w-32 h-32 bg-white rounded-full blur-2xl animate-pulse delay-700"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left space-y-6">
              <div className="space-y-4">
                <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${currentFestival.textColor} leading-tight`}>
                  Celebrate
                  <span className={`block text-yellow-200 italic ${currentFestival.name === 'Navratri' ? 'font-prata' : 'font-serif'}`}>
                    {currentFestival.name}
                  </span>
                </h2>
                <p className={`text-lg md:text-xl ${currentFestival.textColor}/90 font-light max-w-lg mx-auto lg:mx-0`}>
                  {currentFestival.description}
                </p>
              </div>

              <div className="flex justify-center lg:justify-start">
                <Button
                  onClick={scrollToProducts}
                  size="lg"
                  className={`${currentFestival.buttonStyle} font-semibold px-8 py-4 rounded-full text-lg shadow-lg transition-all duration-300 hover:scale-105`}
                >
                  Shop Festival Collection
                </Button>
              </div>
            </div>

            {/* Right side - Festival image */}
            <div className="relative">
              <div className="relative z-10">
                <div className="relative w-full h-80 lg:h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={currentFestival.image}
                    alt={`${currentFestival.name} celebration`}
                    fill
                    className="object-cover transition-transform duration-1000 hover:scale-105"
                    priority
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                </div>
              </div>

              {/* Decorative elements around the image */}
              <div className="absolute -top-4 -left-4 w-6 h-6 bg-yellow-300 rounded-full animate-bounce"></div>
              <div className="absolute -top-2 -right-6 w-4 h-4 bg-white rounded-full animate-bounce delay-300"></div>
              <div className="absolute -bottom-6 -left-2 w-8 h-8 bg-yellow-400 rounded-full animate-bounce delay-700"></div>
              <div className="absolute -bottom-4 -right-4 w-5 h-5 bg-white rounded-full animate-bounce delay-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200"
        aria-label="Previous festival"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200"
        aria-label="Next festival"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {festivals.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-white">
          <path d="M0,0V7.23C0,65.52,268.63,112.77,600,112.77S1200,65.52,1200,7.23V0Z"></path>
        </svg>
      </div>
    </section>
  )
}