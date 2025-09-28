"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useStore } from "@/lib/store"
import { useEffect, useState, useCallback } from "react"

interface Product {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  image_url: string;
  images?: string[]; // Add images array
  category_name: string;
  is_featured: boolean;
  is_active: boolean;
  inventory: number;
}

export default function FeaturedProducts() {
  const addToCart = useStore((state) => state.addToCart)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fallback mock data for when database is unavailable
  const mockProducts: Product[] = [
    {
      id: 1,
      name: "Traditional Gulab Jamun",
      description: "Soft, sweet, and melts in your mouth - made with authentic recipe",
      price_cents: 25000,
      image_url: "/placeholder.svg",
      images: ["/placeholder.svg"],
      category_name: "Sweets",
      is_featured: true,
      is_active: true,
      inventory: 15
    },
    {
      id: 2,
      name: "Special Samosa Mix",
      description: "Crispy and flavorful samosas with traditional spice blend",
      price_cents: 18000,
      image_url: "/placeholder.svg", 
      images: ["/placeholder.svg"],
      category_name: "Snacks",
      is_featured: true,
      is_active: true,
      inventory: 25
    }
  ];

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      setError(null)
      
      const response = await fetch('/api/products?is_featured=true&limit=8')
      const data = await response.json()
      
      console.log('Featured products API response:', data) // Debug log
      
      if (data.success && data.data?.products && data.data.products.length > 0) {
        setProducts(data.data.products)
      } else if (!data.success) {
        // API failed - use fallback data in development
        console.warn('API failed, using fallback data:', data.error)
        setError('Database temporarily unavailable')
        
        if (process.env.NODE_ENV === 'development') {
          setProducts(mockProducts)
        } else {
          setProducts([])
        }
      } else {
        // API succeeded but no products found
        console.log('No featured products found')
        setProducts([])
      }
    } catch (error) {
      console.error('Failed to fetch featured products:', error)
      setError('Failed to load products')
      
      // Use fallback data in development
      if (process.env.NODE_ENV === 'development') {
        setProducts(mockProducts)
      } else {
        setProducts([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeaturedProducts()
  }, [fetchFeaturedProducts])

  const handleAddToCart = (product: Product) => {
    const imageUrl = product.images?.[0] || product.image_url || "/placeholder.svg";
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price_cents / 100, // Convert cents to rupees
      image: imageUrl,
      category: product.category_name,
      isActive: product.is_active,
    })
  }

  if (loading) {
    return (
      <section id="featured-products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-12 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="featured-products" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1">
              <Button variant="ghost" className="text-purple-600 border-b-2 border-purple-600 rounded-none px-6 py-2">
                FEATURED PRODUCTS
              </Button>
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
            Shop Premium Selection
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked collection of traditional Indian sweets and snacks, 
            made with authentic recipes and finest ingredients.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-3">⚠️</div>
              <div>
                <p className="text-yellow-800 font-medium">Service Notice</p>
                <p className="text-yellow-700 text-sm">
                  {process.env.NODE_ENV === 'development' 
                    ? 'Database connection issue - showing sample products for development'
                    : 'Some features may be temporarily unavailable. Please try again later.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 bg-orange-50 cursor-pointer"
              onClick={() => {
                // Example: navigate to product details page
                window.location.href = `/products/${product.id}`;
              }}
            >
              <Badge className="absolute top-3 left-3 z-10 bg-purple-600 text-white px-3 py-1 text-xs font-medium">
                FEATURED
              </Badge>

              <div className="relative h-64 overflow-hidden">
                <Image
                  src={product.images?.[0] || product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>

              <CardContent className="p-6">
                <div className="mb-2">
                  <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                    {product.category_name}
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-800">
                      ₹{(product.price_cents / 100).toFixed(0)}
                    </span>
                    <span className="text-xs text-gray-500">
                      per 500g pack
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Available</div>
                    <div className="text-sm font-medium text-green-600">
                      {product.inventory} packs
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    size="sm"
                    disabled={product.inventory === 0}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition-colors duration-200 disabled:bg-gray-400 flex-1"
                  >
                    {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>
                {product.inventory > 0 && product.inventory <= 10 && (
                  <p className="text-xs text-red-500 mt-2">
                    Only {product.inventory} left in stock!
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-full font-semibold"
            onClick={() => window.location.href = '/products'}
          >
            View All Products
          </Button>
        </div>

        {/* Empty state */}
        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  )
}