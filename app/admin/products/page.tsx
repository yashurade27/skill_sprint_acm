"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Edit, Trash2, Search, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import toast from "react-hot-toast"

interface Product {
  id: number
  name: string
  description: string
  price: number
  inventory: number
  category_name: string
  images: string[]
  is_active: boolean
  is_featured: boolean
  created_at: string
}

export default function AdminProducts() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActive, setFilterActive] = useState("all")

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.role !== "admin") {
      router.push("/auth/login")
      return
    }

    fetchProducts()
  }, [session, status, router])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const url = new URL("/api/products", window.location.origin)
      
      if (searchTerm) {
        url.searchParams.set("search", searchTerm)
      }
      
      if (filterActive !== "all") {
        url.searchParams.set("is_active", filterActive)
      }

      const response = await fetch(url.toString())
      const data = await response.json()

      if (data.success) {
        setProducts(data.data.products)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchProducts()
  }

  const handleDelete = async (productId: number, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return
    }

    const loadingToast = toast.loading(`Deleting ${productName}...`)

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || "Product deleted successfully!", {
          id: loadingToast
        })
        fetchProducts() // Refresh the list
      } else {
        toast.error(data.error || "Failed to delete product", {
          id: loadingToast
        })
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete product", {
        id: loadingToast
      })
    }
  }

  const toggleProductStatus = async (productId: number, currentStatus: boolean) => {
    const loadingToast = toast.loading(
      currentStatus ? "Deactivating product..." : "Activating product..."
    )

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(
          currentStatus ? "Product deactivated!" : "Product activated!",
          { id: loadingToast }
        )
        fetchProducts() // Refresh the list
      } else {
        toast.error(data.error || "Failed to update product", {
          id: loadingToast
        })
      }
    } catch (error) {
      console.error("Toggle status error:", error)
      toast.error("Failed to update product", {
        id: loadingToast
      })
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session || session.user?.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600">Manage your product inventory</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/admin">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
              <Link href="/admin/products/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Products</option>
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                </select>
                <Button onClick={fetchProducts} variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first product.</p>
              <Link href="/admin/products/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className={`${!product.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  {/* Product Image */}
                  <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg truncate pr-2">{product.name}</h3>
                      <div className="flex gap-1">
                        {product.is_featured && (
                          <Badge variant="secondary">Featured</Badge>
                        )}
                        <Badge variant={product.is_active ? "default" : "destructive"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2">
                      {product.description || "No description"}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">₹{product.price}</span>
                      <span className="text-sm text-gray-500">
                        Stock: {product.inventory}
                      </span>
                    </div>

                    <div className="text-sm text-gray-500">
                      Category: {product.category_name || "Uncategorized"}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                      <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleProductStatus(product.id, product.is_active)}
                        className={product.is_active ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                      >
                        {product.is_active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}