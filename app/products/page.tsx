"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, ShoppingCart, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useStore } from "@/lib/store"

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  inventory: number
  category_id: number | null
  image_url: string | null
  images: string[] | null
  is_active: boolean
  is_featured: boolean
  created_at: string
  category_name: string | null
  category_slug: string | null
}

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  product_count?: number
}

interface ProductsResponse {
  success: boolean
  data: {
    products: Product[]
    pagination: {
      page: number
      limit: number
      totalProducts: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

interface CategoriesResponse {
  success: boolean
  data: {
    categories: Category[]
  }
}

const sortOptions = [
  { id: "newest", name: "Newest First" },
  { id: "price-low", name: "Price: Low to High" },
  { id: "price-high", name: "Price: High to Low" },
  { id: "featured", name: "Featured" },
]

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const { addToCart } = useStore()

  const itemsPerPage = 6

  // Fetch products from API
  const fetchProducts = useCallback(async (page: number = 1, params: Record<string, string> = {}) => {
    try {
      setLoading(true)
      const searchParams = new URLSearchParams({
        limit: itemsPerPage.toString(),
        page: page.toString(),
        ...params
      })
      const response = await fetch(`/api/products?${searchParams}`)
      const data: ProductsResponse = await response.json()
      
      if (data.success) {
        setProducts(data.data.products)
        setTotalPages(data.data.pagination.totalPages)
        setTotalProducts(data.data.pagination.totalProducts)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }, [itemsPerPage])

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories?include_product_count=true&only_with_products=true")
      const data: CategoriesResponse = await response.json()
      
      if (data.success) {
        setCategories(data.data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchCategories()
    fetchProducts(1).then(() => {
      setIsInitialLoad(false) // Mark initial load as complete
    })
  }, [fetchProducts])

  // Refetch products when filters change
  useEffect(() => {
    const params: Record<string, string> = {}
    
    if (searchQuery) {
      params.search = searchQuery
    }
    
    if (selectedCategory !== "all") {
      params.category = selectedCategory
    }
    
    if (sortBy === "featured") {
      params.is_featured = "true"
    }
    
    setCurrentPage(1) // Reset to first page when filters change
    fetchProducts(1, params).then(() => {
      setIsInitialLoad(false) // Ensure flag is set after filter changes too
    })
  }, [searchQuery, selectedCategory, sortBy, fetchProducts])

  // Refetch products when page changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad) { // Skip the first render to avoid duplicate calls
      const params: Record<string, string> = {}
      
      if (searchQuery) {
        params.search = searchQuery
      }
      
      if (selectedCategory !== "all") {
        params.category = selectedCategory
      }
      
      if (sortBy === "featured") {
        params.is_featured = "true"
      }
      
      fetchProducts(currentPage, params)
    }
  }, [currentPage, fetchProducts, searchQuery, selectedCategory, sortBy, isInitialLoad])

  // Sort products on the client side for better UX
  const sortedProducts = useMemo(() => {
    const sorted = [...products]
    
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price)
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price)
      case "featured":
        return sorted.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
      case "newest":
      default:
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
  }, [products, sortBy])

  const handleAddToCart = (product: Product) => {
    const imageUrl = product.images?.[0] || product.image_url || "/placeholder.svg"
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      image: imageUrl,
      category: product.category_name || "Uncategorized",
      isActive: product.is_active,
    })
  }

  // All categories option with total count
  const allCategoriesOption = {
    id: "all",
    name: "All Products",
    slug: "all",
    product_count: totalProducts
  }

  const categoryOptions = [allCategoriesOption, ...categories]

  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background from Bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 90%, #fff 35%, #f97316 100%)",
        }}
      />
      
      {/* Content with relative positioning */}
      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 max-w-7xl py-40">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className={`lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm"
                />
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h3 className="font-serif text-lg text-gray-800">Categories</h3>
                {categoryOptions.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors backdrop-blur-sm ${
                      selectedCategory === category.slug
                        ? "bg-orange-100/80 text-orange-800 font-medium"
                        : "text-gray-600 hover:bg-white/60"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-400">
                        ({category.product_count || 0})
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <h3 className="font-serif text-lg text-gray-800">Sort By</h3>
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors backdrop-blur-sm ${
                      sortBy === option.id
                        ? "bg-orange-100/80 text-orange-800 font-medium"
                        : "text-gray-600 hover:bg-white/60"
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-6">
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full bg-white/80 backdrop-blur-sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide Filters' : 'Show Filters & Sort'}
                </Button>
              </div>

              {/* Results Header */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  {!loading && `Showing ${products.length} of ${totalProducts} products`}
                </p>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              )}

              {/* Products Grid */}
              {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedProducts.map((product) => {
                    const imageUrl = product.images?.[0] || product.image_url || "/placeholder.svg"
                    
                    return (
                      <Card
                        key={product.id}
                        className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-white/20 cursor-pointer"
                        onClick={() => router.push(`/products/${product.id}`)}
                      >
                        {product.is_featured && (
                          <Badge className="absolute top-3 left-3 z-10 bg-purple-600 text-white px-3 py-1 text-xs font-medium">
                            FEATURED
                          </Badge>
                        )}
                        
                        {product.inventory === 0 && (
                          <Badge variant="destructive" className="absolute top-3 right-3 z-10">
                            Out of Stock
                          </Badge>
                        )}

                        <div className="relative h-64 overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>

                        <CardContent className="p-6">
                          <div className="mb-2">
                            {product.category_name && (
                              <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                                {product.category_name}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-1">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col">
                              <span className="text-xl font-bold text-gray-800">
                                ₹{product.price.toFixed(0)}
                              </span>
                              <span className="text-xs text-gray-500">
                                per pack
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
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddToCart(product)
                              }}
                              size="sm"
                              disabled={product.inventory === 0}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full transition-colors duration-200 disabled:bg-gray-400 flex-1"
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
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
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center bg-white/80 backdrop-blur-sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[40px] ${
                          currentPage === page 
                            ? "bg-orange-500 hover:bg-orange-600 text-white" 
                            : "bg-white/80 backdrop-blur-sm"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center bg-white/80 backdrop-blur-sm"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* No Results */}
              {!loading && sortedProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                  <Button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("all")
                      setSortBy("newest")
                      setCurrentPage(1)
                    }}
                    variant="outline"
                    className="mt-4 bg-white/80 backdrop-blur-sm"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}