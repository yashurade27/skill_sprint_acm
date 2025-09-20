"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Festival {
  id: number
  name: string
  description: string
  image: string
  bgGradient: string
  textColor: string
  buttonStyle: string
  tag: string
}

const festivals: Festival[] = [
  {
    id: 1,
    name: "Diwali",
    description: "Delight in every bite. Gift joy this festival of lights.",
    image: "/diwali-hero.jpeg",
    bgGradient: "bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-500",
    textColor: "text-white",
    buttonStyle: "bg-white text-orange-600 hover:bg-orange-50",
    tag: "Festival of Lights"
  },
  {
    id: 2,
    name: "Navratri",
    description: "Experience the divine celebration with our traditional festive treats.",
    image: "/navratri-hero.jpeg",
    bgGradient: "bg-gradient-to-br from-pink-500 via-red-500 to-orange-600",
    textColor: "text-white",
    buttonStyle: "bg-white text-pink-700 hover:bg-pink-50",
    tag: "Divine Celebration"
  }
]

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % festivals.length)
    }, 25000) // 25 seconds for much slower transition

    return () => clearInterval(interval)
  }, [])

  const currentFestival = festivals[currentIndex]

  const scrollToProducts = () => {
    const element = document.getElementById("products")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      {/* Background with smooth transition and flowing animation */}
      <div 
        className={`absolute inset-0 ${currentFestival.bgGradient} flowing-gradient smooth-slide-transition`}
        key={`bg-${currentFestival.id}`}
      >
        {/* Background decorative elements with geometric patterns */}
        <div className="absolute inset-0 opacity-25">
          {/* Elegant geometric shapes instead of dots */}
          <div className="absolute top-16 left-8 w-24 h-24 border-2 border-white/70 rotate-45 animate-pulse smooth-slide-transition"></div>
          <div className="absolute top-32 right-16 w-20 h-20 border-2 border-yellow-200/80 rounded-full animate-pulse delay-300 smooth-slide-transition"></div>
          <div className="absolute bottom-40 left-1/4 w-32 h-1.5 bg-white/50 rotate-12 smooth-slide-transition"></div>
          <div className="absolute bottom-28 right-1/3 w-28 h-28 border-2 border-yellow-200/70 rotate-12 animate-pulse delay-500 smooth-slide-transition"></div>
          
          {/* Abstract pattern lines */}
          <div className="absolute top-1/3 left-1/12 w-40 h-0.5 bg-white/50 rotate-45 smooth-slide-transition"></div>
          <div className="absolute top-1/2 right-1/12 w-32 h-0.5 bg-yellow-200/60 -rotate-45 smooth-slide-transition"></div>
          <div className="absolute bottom-1/3 left-1/6 w-24 h-0.5 bg-white/50 rotate-12 smooth-slide-transition"></div>
          
          {/* Floating geometric elements */}
          <div className="absolute top-1/4 right-1/4 w-16 h-16 border border-white/50 rounded-lg rotate-45 animate-bounce delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-12 h-12 bg-yellow-200/35 transform rotate-45 animate-pulse delay-1500"></div>
        </div>
      </div>

      {/* Main hero content with slide animations */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[85vh]">
          {/* Left side - Text content with smooth slide-in animations */}
          <div 
            className="text-center lg:text-left space-y-8 smooth-slide-transition"
            key={`content-${currentFestival.id}`}
          >
            {/* Festival Tag with slide-in effect */}
            <div className="inline-block slide-in-left">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30 smooth-slide-transition">
                ✨ {currentFestival.tag}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold ${currentFestival.textColor} leading-tight smooth-slide-transition fade-in-up`}>
                Celebrate
                <span className="block text-yellow-200 font-prata italic slide-in-right">
                  {currentFestival.name}
                </span>
              </h1>
              <p className={`text-xl md:text-2xl ${currentFestival.textColor}/90 font-light max-w-lg mx-auto lg:mx-0 smooth-slide-transition fade-in-up delay-300`}>
                {currentFestival.description}
              </p>
            </div>

            <div className="flex justify-center lg:justify-start fade-in-up delay-500">
              <Button
                onClick={scrollToProducts}
                size="lg"
                className={`${currentFestival.buttonStyle} font-semibold px-8 py-4 rounded-full text-lg shadow-warm transition-all duration-300 hover:scale-105 smooth-slide-transition`}
              >
                Shop Festival Collection
              </Button>
            </div>

            {/* Additional content below button with staggered animations */}
            <div className="pt-8 space-y-4 fade-in-up delay-700">
              {/* Stats or highlights */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-white/80">
                <div className="text-center slide-in-left delay-800">
                  <div className="text-2xl font-bold text-yellow-200">500+</div>
                  <div className="text-sm">Happy Customers</div>
                </div>
                <div className="text-center slide-in-left delay-1000">
                  <div className="text-2xl font-bold text-yellow-200">50+</div>
                  <div className="text-sm">Varieties</div>
                </div>
                <div className="text-center slide-in-left delay-1200">
                  <div className="text-2xl font-bold text-yellow-200">4.8★</div>
                  <div className="text-sm">Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Festival image with smooth slide transitions */}
          <div className="relative slide-in-right">
            <div className="relative z-10">
              <div 
                className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl smooth-slide-transition hover:scale-105"
                key={`image-${currentFestival.id}`}
              >
                <Image
                  src={currentFestival.image}
                  alt={`${currentFestival.name} celebration`}
                  fill
                  className="object-cover smooth-slide-transition"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicators with smooth transitions */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {festivals.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full smooth-slide-transition ${
              index === currentIndex ? "w-12 bg-white" : "w-8 bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-white">
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
          ></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </section>
  )
}
