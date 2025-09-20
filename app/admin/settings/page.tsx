"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, User, Store, Database, Shield } from "lucide-react"
import Link from "next/link"

export default function AdminSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.role !== "admin") {
      router.push("/auth/login")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
              <p className="text-gray-600">Manage your admin preferences and store settings</p>
            </div>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Profile */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Admin Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={session.user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value="Administrator"
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Store className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="font-semibold text-lg">Store Management</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Manage products, categories, and inventory
              </p>
              <div className="space-y-2">
                <Link href="/admin/products" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Products
                  </Button>
                </Link>
                <Link href="/admin/categories" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Categories
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Database className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="font-semibold text-lg">Data Overview</h3>
              </div>
              <p className="text-gray-600 mb-4">
                View system statistics and data insights
              </p>
              <div className="space-y-2">
                <Link href="/admin/orders" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    View Orders
                  </Button>
                </Link>
                <Link href="/admin" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="font-semibold text-lg">Security</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Security settings and access control
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Change Password
                </Button>
                <Button variant="outline" size="sm" className="w-full" disabled>
                  Two-Factor Auth
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Application</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Version: 1.0.0</p>
                  <p>Environment: Production</p>
                  <p>Last Updated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>✅ Product Management</p>
                  <p>✅ Order Processing</p>
                  <p>✅ Category Management</p>
                  <p>✅ Image Upload (Cloudinary)</p>
                  <p>✅ Payment Integration (Razorpay)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mt-8 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              These actions are irreversible. Please proceed with caution.
            </p>
            <div className="space-y-2">
              <Button variant="destructive" disabled>
                Reset All Data
              </Button>
              <p className="text-sm text-gray-500">
                Contact system administrator for data operations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}