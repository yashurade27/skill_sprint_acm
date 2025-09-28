"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Package, ShoppingCart, Plus } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCategories: number
  recentOrders: Array<{
    id: number
    total_amount: number
    status: string
    customer_email: string
    placed_at: string
  }>
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.role !== "admin") {
      router.push("/auth/login")
      return
    }

    fetchDashboardStats()
  }, [session, status, router])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Fetch products count
      const productsRes = await fetch("/api/products?is_active=true")
      const productsData = await productsRes.json()
      
      // Fetch categories count
      const categoriesRes = await fetch("/api/categories")
      const categoriesData = await categoriesRes.json()
      
      // Fetch orders count and recent orders (admin view)
      const ordersRes = await fetch("/api/orders?admin=true&limit=5")
      const ordersData = await ordersRes.json()

      setStats({
        totalProducts: productsData.data?.pagination?.totalProducts || 0,
        totalCategories: categoriesData.data?.categories?.length || 0,
        totalOrders: ordersData.data?.pagination?.totalOrders || 0,
        recentOrders: ordersData.data?.orders || []
      })
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session.user?.email}</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/">
                <Button variant="outline">View Store</Button>
              </Link>
              <Button onClick={() => router.push("/admin/products/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground">Active products in store</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCategories || 0}</div>
              <p className="text-xs text-muted-foreground">Product categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/products">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Package className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <h3 className="font-semibold">Manage Products</h3>
                  <p className="text-sm text-gray-600">Add, edit, delete products</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/categories">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <TrendingUp className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <h3 className="font-semibold">Manage Categories</h3>
                  <p className="text-sm text-gray-600">Organize product categories</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/orders">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <ShoppingCart className="h-8 w-8 text-purple-600 mr-4" />
                <div>
                  <h3 className="font-semibold">View Orders</h3>
                  <p className="text-sm text-gray-600">Track and manage orders</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-orange-600 mr-4" />
                <div>
                  <h3 className="font-semibold">Manage Users</h3>
                  <p className="text-sm text-gray-600">User accounts and permissions</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentOrders?.length ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer_email}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.placed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{order.total_amount || 0}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent orders</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}