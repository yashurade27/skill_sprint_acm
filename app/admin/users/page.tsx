"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Filter, Shield, UserX, Crown } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

interface User {
  id: number
  email: string
  phone: string | null
  role: string
  email_verified: boolean
  first_name: string | null
  last_name: string | null
  display_name: string
}

export default function AdminUsers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [updating, setUpdating] = useState<number | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const url = new URL("/api/users", window.location.origin)
      
      if (searchTerm) {
        url.searchParams.set("search", searchTerm)
      }
      
      if (roleFilter !== "all") {
        url.searchParams.set("role", roleFilter)
      }

      const response = await fetch(url.toString())
      const data = await response.json()

      if (data.success) {
        setUsers(data.data.users)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }, [searchTerm, roleFilter])

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.role !== "admin") {
      router.push("/auth/login")
      return
    }

    fetchUsers()
  }, [session, status, router, fetchUsers])

  const handleSearch = () => {
    fetchUsers()
  }

  const updateUserRole = async (userId: number, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to "${newRole}"?`)) {
      return
    }

    setUpdating(userId)
    const loadingToast = toast.loading(`Updating user role to ${newRole}...`)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: newRole,
        }),
      })

      const data = await response.json()

      if (data.success) {
        fetchUsers() // Refresh the list
        toast.success(data.message || "User role updated successfully!", {
          id: loadingToast
        })
      } else {
        toast.error(data.error || "Failed to update user role", {
          id: loadingToast
        })
      }
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Failed to update user role", {
        id: loadingToast
      })
    } finally {
      setUpdating(null)
    }
  }

  const deleteUser = async (userId: number, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return
    }

    const loadingToast = toast.loading(`Deleting user ${userEmail}...`)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message || "User deleted successfully!", {
          id: loadingToast
        })
        fetchUsers() // Refresh the list
      } else {
        toast.error(data.error || "Failed to delete user", {
          id: loadingToast
        })
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete user", {
        id: loadingToast
      })
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "user":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
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
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage user accounts and permissions</p>
            </div>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
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
                    placeholder="Search by email or name..."
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
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users Only</option>
                  <option value="admin">Admins Only</option>
                </select>
                <Button onClick={fetchUsers} variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        {users.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">No users match your current search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">
                          {user.display_name}
                        </h3>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role === "admin" ? (
                            <>
                              <Crown className="h-3 w-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            <>
                              <Users className="h-3 w-3 mr-1" />
                              User
                            </>
                          )}
                        </Badge>
                        {user.email_verified && (
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Email:</strong> {user.email}
                        </div>
                        <div>
                          <strong>Phone:</strong> {user.phone || "Not provided"}
                        </div>
                        <div>
                          <strong>User ID:</strong> {user.id}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {user.id !== parseInt(session.user?.id || "0") && (
                        <>
                          {user.role === "user" ? (
                            <Button 
                              size="sm" 
                              onClick={() => updateUserRole(user.id, "admin")}
                              disabled={updating === user.id}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Crown className="h-4 w-4 mr-1" />
                              {updating === user.id ? "Updating..." : "Make Admin"}
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => updateUserRole(user.id, "user")}
                              disabled={updating === user.id}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Users className="h-4 w-4 mr-1" />
                              {updating === user.id ? "Updating..." : "Make User"}
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteUser(user.id, user.email)}
                            disabled={updating === user.id}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                      
                      {user.id === parseInt(session.user?.id || "0") && (
                        <Badge variant="secondary">Current User</Badge>
                      )}
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