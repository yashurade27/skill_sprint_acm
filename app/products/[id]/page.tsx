"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, ShoppingCart, Heart, Share2, Minus, Plus, ArrowLeft, Truck, Shield, RotateCcw, Loader2 } from "lucide-react"
import { useStore } from "@/lib/store"

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  inventory: number
  category_id: number | null
  image_url: string | null
  is_active: boolean
  created_at: string
  category_name: string | null
  category_slug: string | null
  category_description: string | null
}

interface ProductResponse {
  success: boolean
  data?: {
    product: Product
  }
  error?: string
}

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const productId = params.id as string

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${productId}`)
        const data: ProductResponse = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch product')
        }
        
        if (data.success && data.data) {
          setProduct(data.data.product)
        } else {
          throw new Error(data.error || 'Product not found')
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        setError(error instanceof Error ? error.message : "Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleAddToCart = () => {
    if (!product) return
    
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      image: product.image_url || "/placeholder.svg",
      category: product.category_name || "Uncategorized",
      isActive: product.is_active,
    })
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && product && newQuantity <= product.inventory) {
      setQuantity(newQuantity)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full relative">
        {/* Radial Gradient Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #f97316 100%)",
          }}
        />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <div className="flex justify-center items-center py-20 flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
          <Footer />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen w-full relative">
        {/* Radial Gradient Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #f97316 100%)",
          }}
        />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <div className="container mx-auto px-4 max-w-7xl py-20 text-center flex-1 flex flex-col justify-center">
            <h1 className="text-2xl font-serif text-gray-800 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">{error || "The product you're looking for doesn't exist."}</p>
            <Button onClick={() => router.push("/products")} className="bg-orange-500 hover:bg-orange-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>
          <Footer />
        </div>
      </div>
    )
  }

  const isInStock = product.inventory > 0
  const images = product.image_url ? [product.image_url] : ["/placeholder.svg"]

  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 40%, #f97316 100%)",
        }}
      />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="container mx-auto px-4 max-w-7xl py-30 flex-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <button 
              onClick={() => router.push("/products")} 
              className="hover:text-orange-600 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Products
            </button>
            <span>/</span>
            <span className="capitalize">{product.category_name || "Products"}</span>
            <span>/</span>
            <span className="text-gray-800">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-lg bg-white/90 backdrop-blur-sm border border-white/20">
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  width={600}
                  height={500}
                  className="w-full h-96 lg:h-[500px] object-cover"
                />
                {!isInStock && (
                  <Badge variant="destructive" className="absolute top-4 right-4">
                    Out of Stock
                  </Badge>
                )}
              </div>

              {/* Thumbnail Images - only show if multiple images */}
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative overflow-hidden rounded-lg border-2 transition-colors bg-white/80 backdrop-blur-sm ${
                        selectedImage === index ? "border-orange-500" : "border-white/20"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h1 className="text-3xl font-serif text-gray-800 mb-2">{product.name}</h1>
                
                {/* Category */}
                {product.category_name && (
                  <Badge variant="secondary" className="mb-4">
                    {product.category_name}
                  </Badge>
                )}

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-bold text-gray-800">₹{product.price.toFixed(2)}</span>
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
                )}

                {/* Stock Status */}
                <div className="flex items-center gap-2 mb-6">
                  <div className={`w-3 h-3 rounded-full ${isInStock ? "bg-green-500" : "bg-red-500"}`} />
                  <span className={`font-medium ${isInStock ? "text-green-600" : "text-red-600"}`}>
                    {isInStock ? `In Stock (${product.inventory} available)` : "Out of Stock"}
                  </span>
                </div>

                {/* Quantity Selector */}
                {isInStock && (
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-medium text-gray-700">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="h-10 w-10 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.inventory}
                        className="h-10 w-10 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 mb-6">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!isInStock}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-12"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {isInStock ? `Add to Cart - ₹${(product.price * quantity).toFixed(2)}` : "Out of Stock"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`h-12 w-12 p-0 bg-white/80 backdrop-blur-sm ${isWishlisted ? "text-red-500 border-red-500" : ""}`}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" className="h-12 w-12 p-0 bg-white/80 backdrop-blur-sm">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <Truck className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm font-medium">Free Delivery</p>
                    <p className="text-xs text-gray-500">On orders above ₹500</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm font-medium">Quality Assured</p>
                    <p className="text-xs text-gray-500">Fresh & authentic</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="mt-16">
            <Card className="bg-white/90 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Delivery Information</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Free Delivery</p>
                        <p className="text-gray-600">On orders above ₹500</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Standard Delivery</p>
                        <p className="text-gray-600">2-4 business days</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-10">
                    <h3 className="font-semibold mb-3">Return Policy</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Quality Guarantee</p>
                        <p className="text-gray-600">100% fresh and authentic products</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Refund Process</p>
                        <p className="text-gray-600">Quick refund processing within 3-5 business days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}