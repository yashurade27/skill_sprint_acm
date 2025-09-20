import { Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    type: "text",
    stars: 5,
    text: "Best fresh Indian food and traditional sweets in the area. The quality is exceptional!",
    author: "Dinesh Kumavat",
    bgColor: "bg-purple-200",
    textColor: "text-purple-900",
    starColor: "text-purple-600",
  },
  {
    id: 2,
    type: "image",
    image: "https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299609/products/chakli.jpg",
    alt: "Traditional Chakli snacks",
  },
  {
    id: 3,
    type: "text",
    stars: 5,
    text: "Had an amazing experience with their traditional sweets. Very tasty and authentic 😊",
    author: "Suman Shah",
    bgColor: "bg-red-400",
    textColor: "text-white",
    starColor: "text-white",
  },
  {
    id: 4,
    type: "image",
    image: "https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299611/products/besan-laddo.jpg",
    alt: "Fresh Besan Laddo",
  },
  {
    id: 5,
    type: "text",
    stars: 5,
    text: "The packaging was beautiful and the sweets were delicious. Thank you for making our celebration more special.",
    author: "Divya Chugani",
    bgColor: "bg-white",
    textColor: "text-gray-900",
    starColor: "text-gray-900",
  },
  {
    id: 6,
    type: "image",
    image: "https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299614/products/karanji.jpg",
    alt: "Traditional Karanji sweets",
  },
  {
    id: 7,
    type: "text",
    stars: 4,
    text: "Purchased for my neighbor. She said everything was delicious and fresh! She was very happy with the quality.",
    author: "Meeta Kherdel",
    bgColor: "bg-yellow-300",
    textColor: "text-blue-700",
    starColor: "text-blue-600",
  },
  {
    id: 8,
    type: "image", 
    image: "https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299616/products/poha-chivda.jpg",
    alt: "Crispy Poha Chivda",
  },
  {
    id: 9,
    type: "text",
    stars: 5,
    text: "Amazing quality and taste! These traditional sweets remind me of my grandmother's cooking. Highly recommended!",
    author: "Rajesh Patel",
    bgColor: "bg-green-300",
    textColor: "text-green-900",
    starColor: "text-green-700",
  },
  {
    id: 10,
    type: "image",
    image: "https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299617/products/ukdiche-modak.jpg",
    alt: "Authentic Ukdiche Modak",
  },
  {
    id: 11,
    type: "text",
    stars: 5,
    text: "Perfect for festivals! The taste is authentic and fresh. My family loved every bite of these traditional treats.",
    author: "Priya Sharma",
    bgColor: "bg-pink-300",
    textColor: "text-pink-900",
    starColor: "text-pink-700",
  },
  {
    id: 12,
    type: "image",
    image: "https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299619/products/puran-poli.jpg",
    alt: "Sweet Puran Poli",
  },
  {
    id: 13,
    type: "text",
    stars: 4,
    text: "Great service and quick delivery! The snacks were perfectly crispy and flavorful. Will definitely order again.",
    author: "Amit Kumar",
    bgColor: "bg-orange-300",
    textColor: "text-orange-900",
    starColor: "text-orange-700",
  },
  {
    id: 14,
    type: "image",
    image: "https://res.cloudinary.com/djgfbq5ql/image/upload/v1758299620/products/shankarpali.jpg",
    alt: "Crunchy Shankarpali",
  },
  {
    id: 15,
    type: "text",
    stars: 5,
    text: "The best traditional sweets I've had outside of India! The flavors are authentic and bring back childhood memories.",
    author: "Neha Joshi",
    bgColor: "bg-indigo-300",
    textColor: "text-indigo-900",
    starColor: "text-indigo-700",
  },
  {
    id: 16,
    type: "text",
    stars: 5,
    text: "Outstanding quality and freshness! Perfect for gifting to friends and family. Everyone was impressed.",
    author: "Vikram Singh",
    bgColor: "bg-teal-300",
    textColor: "text-teal-900",
    starColor: "text-teal-700",
  },
  {
    id: 17,
    type: "text",
    stars: 4,
    text: "Love the variety of snacks available. Each item is made with care and traditional recipes. Highly satisfied!",
    author: "Kavita Reddy",
    bgColor: "bg-cyan-300",
    textColor: "text-cyan-900",
    starColor: "text-cyan-700",
  },
  {
    id: 18,
    type: "text",
    stars: 5,
    text: "These sweets made our Diwali celebration extra special. The taste and presentation were absolutely perfect!",
    author: "Ravi Agarwal",
    bgColor: "bg-lime-300",
    textColor: "text-lime-900",
    starColor: "text-lime-700",
  },
  {
    id: 19,
    type: "text",
    stars: 5,
    text: "Fresh ingredients and authentic taste! You can tell these are made with love and traditional methods.",
    author: "Sunita Gupta",
    bgColor: "bg-rose-300",
    textColor: "text-rose-900",
    starColor: "text-rose-700",
  },
  {
    id: 20,
    type: "text",
    stars: 4,
    text: "Excellent packaging ensures everything arrives fresh. The snacks are perfect for sharing with friends and colleagues.",
    author: "Deepak Mehta",
    bgColor: "bg-violet-300",
    textColor: "text-violet-900",
    starColor: "text-violet-700",
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 bg-gray-50 overflow-hidden">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">What people are saying</h2>
        <div className="w-16 h-0.5 bg-gray-400 mx-auto"></div>
      </div>

      <div className="relative">
        <div className="flex animate-scroll-left" style={{ width: 'calc(200% + 100px)' }}>
          {/* First set of testimonials */}
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
          {/* Duplicate set for seamless loop */}
          {testimonials.map((testimonial) => (
            <TestimonialCard key={`duplicate-${testimonial.id}`} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface Testimonial {
  type: string;
  image?: string;
  alt?: string;
  content?: string;
  author?: string;
  rating?: number;
  bgColor?: string;
  textColor?: string;
  starColor?: string;
  stars?: number;
  text?: string;
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  if (testimonial.type === "image") {
    return (
      <div className="flex-shrink-0 w-64 h-80 mx-3">
        <Image
          src={testimonial.image || ''}
          alt={testimonial.alt || 'Testimonial image'}
          width={256}
          height={320}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    )
  }

  return (
    <Card className={`flex-shrink-0 w-64 h-80 mx-3 p-6 flex flex-col justify-between ${testimonial.bgColor} border-0`}>
      <div>
        <div className="flex mb-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < (testimonial.stars || 0) ? `${testimonial.starColor || 'text-yellow-400'} fill-current` : "text-gray-300"}`}
            />
          ))}
        </div>
        <p className={`text-base leading-relaxed ${testimonial.textColor} font-medium`}>{testimonial.text}</p>
      </div>
      <div className="mt-4">
        <p className={`font-semibold ${testimonial.textColor}`}>{testimonial.author}</p>
      </div>
    </Card>
  )
}