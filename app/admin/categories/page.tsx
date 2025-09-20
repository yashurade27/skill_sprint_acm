"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Plus, Edit, Trash2, Package } from "lucide-react"
import Link from "next/link"

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  product_count: number
  created_at: string
}

export default function AdminCategories() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.role !== "admin") {
      router.push("/auth/login")
      return
    }

    fetchCategories()
  }, [session, status, router])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/categories?include_product_count=true")
      const data = await response.json()

      if (data.success) {
        setCategories(data.data.categories)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (categoryId: number, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        alert(data.message)
        fetchCategories() // Refresh the list
      } else {
        alert(data.error || "Failed to delete category")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete category")
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
              <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
              <p className="text-gray-600">Organize and manage product categories</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/admin">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
              <Link href="/admin/categories/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first product category.</p>
              <Link href="/admin/categories/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Category Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">/{category.slug}</p>
                      </div>
                      <Badge variant="secondary" className="flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        {category.product_count}
                      </Badge>
                    </div>

                    {/* Description */}
                    {category.description && (
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {category.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="text-sm text-gray-500">
                      <p>{category.product_count} product{category.product_count !== 1 ? 's' : ''}</p>
                      <p>Created: {new Date(category.created_at).toLocaleDateString()}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                      <Link href={`/admin/categories/${category.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category.id, category.name)}
                        disabled={category.product_count > 0}
                        title={category.product_count > 0 ? "Cannot delete category with products" : "Delete category"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {category.product_count > 0 && (
                      <p className="text-xs text-amber-600">
                        Move or delete all products before deleting this category
                      </p>
                    )}
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